import Head from "next/head";
import { useRecoilState, useRecoilValue } from "recoil";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { generalState } from "../recoil/atom/generalState";
import { HEADER_HEIGHT } from "../utils/constant";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  Input,
  MenuItem,
  Select,
  Stack,
  TextField,
  Button,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { yellow, purple } from "@mui/material/colors";
import { useFormik } from "formik";
import Google from "../components/Google/google";
import Outlook from "../components/Outlook/outlook";
import axiosClient from "../lib/axiosClient";
import { toast } from "react-toastify";

const ButtonPrimary = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText(purple[500]),
  marginRight: 10,
  backgroundColor: "#4c2276",
  "&:hover": {
    backgroundColor: "#200E32",
  },
  textTransform: "capitalize",
}));

const initialState = {
  title: "",
  attendees: "",
  startDateTime: "",
  endDateTime: "",
  content: "",
};

export default function Index({ index }) {
  const { isLogged } = useRecoilValue(generalState);
  const router = useRouter();
  const [googleTrigger, setGoogleTrigger] = useState(0)
  const [outlookTrigger, setOutlookTrigger] = useState(0)
  const [type, setType] = useState("Google");
  useEffect(() => {
    formik.setValues(initialState);
  }, []);
  useEffect(() => {
    let query = router.query;
    if (query.signed =="true") {
      setOutlookTrigger(true)
    }
    else if (query.signed=="false"){
      setOutlookTrigger(false)
      toast.error(query.error)
    }
    console.log("🚀 ~ file: index.js:56 ~ useEffect ~ query:", query)
  },[router])
  const formik = useFormik({
    initialValues: initialState,
    // validationSchema: Yup.object({
    //   title: Yup.string()
    //     .required(userModal.msgEmtyUsername),
    //   attendees: yup.string().email().matches(/^(?!.*@[^,]*,)/)
    //   .matches(/.*[^\s*]/g, userModal.msgEmtyPassword)
    // }),
    onSubmit: async (values) => {
      console.log("🚀 ~ file: index.js:58 ~ onSubmit: ~ values:", values)
      let event = { ...values };
        event.attendees = formik?.values?.attendees.trim() ? formik.values.attendees.trim().split(","): []
        console.log(event)
      if (type == "Google") {
        axiosClient
          .post("/create-event", event)
          .then((response) => {
            console.log(response.data);
            toast.success("Send Google Event successfully")
          })
          .catch((err) => {
            let msg = err.response.data.msg;
            console.log(msg);
            if (msg === "NeedAuthenticateGoogle") {
              toast.error("Need authenticate Google")
              setGoogleTrigger(googleTrigger + 1)
            }
            else {
              toast.error(msg)
            }
          });
      } else {
        console.log("outlook")
        axiosClient
          .post("/create-event-outlook", event)
          .then((response) => {
            console.log("response")
            console.log(response.data);
            toast.success("Send Outlook Event successfully")
          })
          .catch((err) => {
            let msg = err?.response?.data?.msg;
            console.log("catch err")
            console.log(err);
            if (msg === "NeedRe-Authenticate") {
              toast.error("Need authenticate Outlook")
              setOutlookTrigger(false)
            }
            else {
              toast.error(msg)
            }
          });
      }
    },
  });
  return (
    <>
      <Head>
        <title>Home</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main
        className={"main no-body-scroll"}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: `calc(100vh - ${HEADER_HEIGHT}px)`,
          overflow: "auto",
        }}
      >
        <div className={"container"}>
          <div className="center">
            <h1>Create calendar event</h1>
          </div>
          <div className="center">
          <Grid item xs={6} style={{ margin: "15px" }}>
            <Stack direction="row" spacing={2} className="center">
            <Google trigger={googleTrigger}/>
            <Outlook trigger={outlookTrigger}/>
            </Stack>
          </Grid>
          </div>
          <Box xs={6} style={{ border: "1px solid black" }}>
            <Grid item xs={6} style={{ margin: "15px" }}>
              <Stack direction="row" spacing={2} className="form-input">
                <TextField
                  id="outlined-basic"
                  label="Title"
                  variant="outlined"
                  name={"title"}
                  value={formik.values.title}
                  onChange={formik.handleChange}
                />
                <FormControlLabel
                  control={
                    <Select
                      labelId="demo-simple-select-helper-label"
                      id="demo-simple-select-helper"
                      value={type}
                      // label="type"
                      onChange={(e) => setType(e.target.value)}
                    >
                      <MenuItem value={"Google"}>
                        <em className="normal-font">Google</em>
                      </MenuItem>
                      <MenuItem value={"Outlook"}>
                        <span className="normal-font">Outlook</span>
                      </MenuItem>
                    </Select>
                  }
                />
              </Stack>
              <Stack direction="row" spacing={2} className="form-input">
                <TextField
                  id="outlined-basic"
                  label="Attendees"
                  variant="outlined"
                  name={"attendees"}
                  value={formik.values.attendees}
                  onChange={formik.handleChange}
                />
              </Stack>
              <Stack direction="row" spacing={2} className="form-input">Start Date</Stack>
              <Stack direction="row" spacing={2} className="form-input">
                <TextField
                  id="outlined-basic"
                  type="datetime-local"
                  variant="outlined"
                  name={"startDateTime"}
                  value={formik.values.startDateTime}
                  onChange={formik.handleChange}
                />
              </Stack>
              <Stack direction="row" spacing={2} className="form-input">End Date</Stack>
              <Stack direction="row" spacing={2} className="form-input">
                <TextField
                  id="outlined-basic"
                  type="datetime-local"
                  variant="outlined"
                  name={"endDateTime"}
                  placeholder=""
                  value={formik.values.endDateTime}
                  onChange={formik.handleChange}
                />
              </Stack>
              <Stack direction="row" spacing={2} className="form-input">
                <TextField
                  id="outlined-basic"
                  label="Content"
                  variant="outlined"
                  name={"content"}
                  value={formik.values.content}
                  onChange={formik.handleChange}
                />
              </Stack>
              <Stack direction="row" spacing={2} className="form-input">
                <ButtonPrimary
                  onClick={() => {
                    formik.handleSubmit();
                  }}
                  variant="contained"
                >
                  Send
                </ButtonPrimary>
              </Stack>
            </Grid>
          </Box>
          <Box>
            {/* <form onSubmit={handleSubmit}>
                  <label htmlFor="summary">Summary</label>
                  <br />
                  <input
                    type="text"
                    id="summary"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                  />
                  <br />

                  <label htmlFor="description">description</label>
                  <br />
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <br />

                  <label htmlFor="location">location</label>
                  <br />
                  <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <br />

                  <label htmlFor="startDateTime">startDateTime</label>
                  <br />
                  <input
                    type="datetime-local"
                    id="startDateTime"
                    value={startDateTime}
                    onChange={(e) => setStartDateTime(e.target.value)}
                  />
                  <br />

                  <label htmlFor="endDateTime">endDateTime</label>
                  <br />
                  <input
                    type="datetime-local"
                    id="endDateTime"
                    value={endDateTime}
                    onChange={(e) => setEndDateTime(e.target.value)}
                  />
                  <br />
                  <button type="submit">Create</button>
                </form> */}
          </Box>
        </div>
      </main>
    </>
  );
}
