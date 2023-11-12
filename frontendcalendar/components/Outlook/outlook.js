import Head from "next/head";
import MicrosoftLogin from "react-microsoft-login";
import { useEffect, useState } from "react";
import { useRecoilValue, useRecoilState } from "recoil";
import { useRouter } from "next/router";
import { Box, ButtonBase } from "@mui/material";

import { Button } from "react-bootstrap";
import { Login } from "@mui/icons-material";
import axiosClient from "../../lib/axiosClient";
import axios from "axios";
export default function Outlook({trigger}) {

  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    if (signedIn != trigger){
      setSignedIn(trigger)
    }
  },[trigger])
  const client_secret = "S2j8Q~lLWgzg3mIRNb9CVknnQy2RnIRuIJVIOcCL";
  const YOUR_CLIENT_ID = "1c5c63b9-0aa3-4a7b-92a4-5086663fac8f";
  const redirectUri = "http://localhost:8080/token";
  const authHandler = (err, data, msalInstance) => {
    console.log(err);
    console.log(data);
    console.log(msalInstance);
    if (data) {
      setSignedIn(true);
    }
  };
  const graphScopes = ["user.read", "Calendars.ReadWrite", "offline_access"];
  const tenant = "da6567ff-452d-4b86-95a2-dcd96720f222";
  const client_id = "1c5c63b9-0aa3-4a7b-92a4-5086663fac8f";
  // const response_type =
  // const redirect_uri =
  // const response_mode =
  // const scope =
  const handleSignIn = async () => {
    // const path = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?client_id=${client_id}
    // &response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}
    // &response_mode=query
    // &scope=${encodeURIComponent('offline_access User.Read Calendars.ReadWrite')}
    // &state=12345`
    const path = `http://localhost:8080/auth?url=${encodeURIComponent(
      "http://localhost:3000"
    )}`;
    window.open(path);
    // const response = await axios.get(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`, {
    // params: {
    //   'client_id': client_id,
    //   'response_type': 'code',
    //   'redirect_uri': redirectUri,
    //   'response_mode': 'query',
    //   'scope': 'offline_access User.Read Calendars.ReadWrite',
    //   'state': '12345'
    // }
    // });
    // console.log("🚀 ~ file: outlook.js:78 ~ handleSignIn ~ response:", response)
  };
  return (
    <>
      {!signedIn ? (
        <div>
          {/* <MicrosoftLogin
            clientId={YOUR_CLIENT_ID}
            authCallback={authHandler}
            graphScopes={graphScopes}
            response_mode={"query"}
            response_type={"code"}
            redirectUri={redirectUri}
            withUserData={true}
          /> */}
          <Button onClick={handleSignIn}>Sign in with Outlook 🚀 </Button>
        </div>
      ) : (
        <p>Outlook is authenticated</p>
      )}
    </>
  );
}
