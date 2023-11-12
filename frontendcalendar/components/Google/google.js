import { GoogleOAuthProvider } from "@react-oauth/google";

import { useEffect, useImperativeHandle, useState } from "react";

import GoogleSigIn from "./GoogleSigIn";
export default function Google({trigger, ref}) {
  
  useEffect(() => {
    setSignedIn(false)
  },[trigger])
  const [signedIn, setSignedIn] = useState(false);
  return (
    <>
      {!signedIn ? (
        <div>
          <GoogleOAuthProvider clientId="746403853757-vlmqq1kl977pov1fdi20hq26see00bk4.apps.googleusercontent.com">
            <GoogleSigIn isSignedIn={(e) => setSignedIn(e)} />
          </GoogleOAuthProvider>
        </div>
      ) : (
        <div>
          <p>Google is Authenticated</p>
        </div>
      )
      }
    </>
  );
}
