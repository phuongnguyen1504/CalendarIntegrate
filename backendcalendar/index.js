const express = require("express");
const cors = require("cors");

require("dotenv").config();
const bodyParser = require("body-parser");
const { readdirSync } = require("fs-extra");
const url = require("url");
const { google } = require("googleapis");
const fs = require("fs");
const msal = require("@azure/msal-node");
const axios = require("axios");
let googleTokenJson = require("./tokenFile/google-token.json");
let outlookTokenJson = require("./tokenFile/outlook-token.json");

// Authentication parameters
const OUTLOOK_CLIENTID = process.env.OUTLOOK_CLIENTID;
const OUTLOOK_CLIENTSECRET = process.env.OUTLOOK_CLIENTSECRET;
const OUTLOOK_TENANTID = process.env.OUTLOOK_TENANTID;
const OUTLOOK_REDIRECT_URI = process.env.OUTLOOK_REDIRECT_URI;
const OutlookConfig = {
  auth: {
    clientId: OUTLOOK_CLIENTID,
    authority: `https://login.microsoftonline.com/${OUTLOOK_TENANTID}`,
    clientSecret: OUTLOOK_CLIENTSECRET,
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message, containsPii) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: msal.LogLevel.Verbose,
    },
  },
};
// Initialize MSAL Node object using authentication parameters
const cca = new msal.ConfidentialClientApplication(OutlookConfig);

//Authenticate Google paramater
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI
const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

const app = express();
const corsOptions = {
  origin: process.env.FE_ORIGIN,
  // origin: "http://cnote.novasquare.vn:3000",
};
console.log("corsOptions: ", corsOptions);
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Outlook
app.get("/auth", (req, res) => {
  let state = req.query.url;

  // Construct a request object for auth code
  const authCodeUrlParameters = {
    scopes: ["user.read", "Calendars.ReadWrite", "offline_access"],
    state: state,
    redirectUri: OUTLOOK_REDIRECT_URI,
  };

  // Request auth code, then redirect
  cca
    .getAuthCodeUrl(authCodeUrlParameters)
    .then((response) => {
      res.redirect(response);
    })
    .catch((error) => res.send(error));
});

app.get("/redirect", async (req, res) => {
  // console.log(req.query)
  let redirect_url = req.query.state;
  let code = req.query.code;
  await accquireTokenOutlook(code, res, redirect_url);

  // Use the auth code in redirect request to construct
  // a token request object
  // const tokenRequest = {
  //     code: req.query.code,
  //     scopes: ["user.read", "Calendars.ReadWrite", "offline_access"],
  //     redirectUri: REDIRECT_URI,
  // };

  // // Exchange the auth code for tokens
  // cca.acquireTokenByCode(tokenRequest)
  //     .then((response) => {
  //         // res.send(response);
  //         console.log(response)
  //         res.redirect(redirect_url);
  //     }).catch((error) => res.status(500).send(error));
});
app.post("/create-event-outlook", async (req, res) => {
  try {
    const { title, content, location, startDateTime, endDateTime, attendees } =
      req.body;
    let listAttendees = [];
    for (const item of attendees) {
      listAttendees.push({
        emailAddress: { address: item.trim() },
        type: "required",
      });
    }
    let event = {
      subject: title,
      body: {
        contentType: "HTML",
        content: content,
      },
      start: {
        dateTime: new Date(startDateTime).toISOString(),
        timeZone: "Pacific Standard Time",
      },
      end: {
        dateTime: new Date(endDateTime).toISOString(),
        timeZone: "Pacific Standard Time",
      },
      location: {
        displayName: location,
      },
      attendees: listAttendees,
      allowNewTimeProposals: true,
    };
    let token = outlookTokenJson;
    let access_token = token.access_token;
    if (access_token) {
      let eventResponse = await createEventOutlook(access_token, event);
      if (eventResponse.success) {
        return res.json(eventResponse.data);
      } else {
        if (eventResponse?.data?.status == 401) {
          console.log("renew token");
          let result = await renewOutlookToken(token);
          if (result.success) {
            let responseEvent = await createEventOutlook(
              result.access_token,
              event
            );
            if (responseEvent.success) {
              let result = {
                success: true,
                data: responseEvent.data,
              };
              return res.json(result);
            }
          } else {
            return res.json(result);
          }
        }
      }
    }
    // else {
    return res.status(400).json({ msg: "NeedRe-Authenticate" });
    // }
  } catch (err) {
    return res.status(400).json({ msg: err.toString() });
  }
});
// app.get("/token", async (req, res) => {
//   try {
//     const code = req.query.code;
//     console.log(req.query);
//     return res.json(code);
//   } catch (err) {
//     return res.status(400).json(err);
//   }
// });
//Google calendar
app.post("/create-token", async (req, res) => {
  try {
    const code = req.body.code;
    console.log(req.body);
    const { tokens } = await oauth2Client.getToken(code);
    let data = JSON.stringify(tokens);
    fs.writeFile("google-token.json", data, (err) => {
      if (err) throw err;
      console.log("Data written to file");
    });
    return res.json(tokens);
  } catch (err) {
    return res.status(400).json(err);
  }
});

app.post("/create-event", async (req, res) => {
  try {
    if (googleTokenJson.refresh_token) {
      oauth2Client.setCredentials({
        refresh_token: googleTokenJson.refresh_token,
      });
    } else {
      return res.status(400).json({ msg: "NeedAuthenticateGoogle" });
    }
    const { title, content, location, startDateTime, endDateTime, attendees } =
      req.body;
    let listAttendees = [];
    for (const item of attendees) {
      listAttendees.push({ email: item.trim() });
    }
    const calendar = google.calendar("v3");
    const response = await calendar.events.insert({
      auth: oauth2Client,
      calendarId: "primary",
      requestBody: {
        summary: title,
        description: content,
        location: location,
        colorId: "7",
        start: {
          dateTime: new Date(startDateTime).toISOString(),
        },
        end: {
          dateTime: new Date(endDateTime).toISOString(),
        },
        attendees: listAttendees,
      },
    });
    return res.status(200).json(response);
  } catch (err) {
    return res.status(400).json({ msg: err.toString() });
  }
});
console.log("AUTHORIZE_TYPE: ", process.env.AUTHORIZE_TYPE);

console.log("AUTHORIZE_TYPE: ", process.env.AUTHORIZE_TYPE);
if (process.env.AUTHORIZE_TYPE == "test") {
  app.use((req, res, next) => {
    req.body.createdBy = 2;
    req.body.updatedBy = 2;
    return next();
  });
} else {
  // app.use(bearerToken());
  app.use((req, res, next) => {
    console.log("New req for %s", req.originalUrl);
    return next();
  });
}
// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Schedule Cloud application." });
});

const PORT = process.env.PORT || 8080;
// set port, listen for requests
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
async function createEventOutlook(access_token, event) {
  let path = "https://graph.microsoft.com/v1.0/me/events";
  let config = {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  };
  let result = {
    success: false,
    data: null,
  };
  await axios
    .post(path, event, config)
    .then((response) => {
      result = {
        success: true,
        data: response.data,
      };
    })
    .catch((error) => {
      console.log(
        "🚀 ~ file: index.js:285 ~ createEventOutlook ~ error:",
        error
      );
      result = {
        success: false,
        data: JSON.parse(JSON.stringify(error)),
      };
    });
  return result;
}

async function renewOutlookToken(token) {
  let path = `https://login.microsoftonline.com/${OUTLOOK_TENANTID}/oauth2/v2.0/token`;
  let result = {
    success: false,
    data: null,
  };
  await axios
    .post(
      path,
      new URLSearchParams({
        client_id: OUTLOOK_CLIENTID,
        scope: "User.Read Calendars.ReadWrite offline_access",
        refresh_token: token.refresh_token,
        redirect_uri: "http://localhost:8080/redirect",
        grant_type: "refresh_token",
        client_secret: OUTLOOK_CLIENTSECRET,
      })
    )
    .then((response) => {
      let data = JSON.stringify(response.data);
      //response.data là token bao gồm access_token và refresh_token
      // fs.writeFile("outlook-token.json", data, (err) => {
      //   if (err) throw err;
      //   console.log("Data written to file");
      // });
      result = {
        success: true,
        access_token: JSON.parse(data).access_token,
      };
    })
    .catch((error) => {
      result = {
        success: false,
        access_token: "",
        error: JSON.parse(JSON.stringify(error)),
      };
    });
  return result;
}

async function accquireTokenOutlook(code, res, redirect_url) {
  let path = `https://login.microsoftonline.com/${OUTLOOK_TENANTID}/oauth2/v2.0/token`;
  await axios
    .post(
      path,
      new URLSearchParams({
        client_id: OUTLOOK_CLIENTID,
        scope: "User.Read Calendars.ReadWrite offline_access",
        code: code,
        redirect_uri: "http://localhost:8080/redirect",
        grant_type: "authorization_code",
        client_secret: OUTLOOK_CLIENTSECRET,
      })
    )
    .then((response) => {
      let data = JSON.stringify(response.data);
      //response.data là token bao gồm access_token và refresh_token
      fs.writeFile("outlook-token.json", data, (err) => {
        if (err) throw err;
        console.log("Data written to file");
      });
      res.redirect(redirect_url + "?signed=true");
    })
    .catch((error) => {
      res.redirect(redirect_url + `?signed=false&error=${error.toString()}`);
    });
}
