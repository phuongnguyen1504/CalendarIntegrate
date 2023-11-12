// import { GoogleLogin } from "@react-oauth/google";
import { useGoogleLogin } from "@react-oauth/google";
import { useEffect, useState } from "react";
import { useRecoilValue, useRecoilState } from "recoil";
import { useRouter } from "next/router";
import { Box } from "@mui/material";
import { Button } from "react-bootstrap";
import { Login } from "@mui/icons-material";
import axiosClient from "../../lib/axiosClient";
const GoogleSigIn = ({isSignedIn}) => {
  const responseGoogle = (response) => {
    console.log(response);
    const { code } = response;
    console.log("🚀 ~ file: googleLogins.js:15 ~ responseGoogle ~ code:", code);
    const path = "/create-token";
    if (code) {
      axiosClient
        .post(path, { code: code })
        .then((response) => {
          console.log(response.data);
          isSignedIn(true);
        })
        .catch((err) => {
          console.log(err);
          isSignedIn(false)
        });
    }
  };
  const login = useGoogleLogin({
    onSuccess: (codeResponse) => responseGoogle(codeResponse),
    flow: "auth-code",
    scope:
      "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
  });
  return (
    <>
      <Button onClick={() => login()}>Sign in with Google 🚀 </Button>
    </>
  );
};
export default GoogleSigIn;
