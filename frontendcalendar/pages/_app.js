import "bootstrap/dist/css/bootstrap.css";
import "@fullcalendar/common/main.css";
import "@fullcalendar/daygrid/main.css";
import "@fullcalendar/timegrid/main.css";
import "@fullcalendar/timeline/main.css";
import "@fullcalendar/resource-timeline/main.css";
import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.css";
import "../styles/styles.scss";
import PropTypes from "prop-types";
import React from "react";
import Router from "next/router";
import CssBaseline from "@mui/material/CssBaseline";
import NProgress from "nprogress";
import { ToastContainer } from "react-toastify";
import { SSRProvider } from "react-bootstrap";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import { RecoilRoot } from "recoil";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import ja from "date-fns/locale/ja";
require("moment/locale/ja");
registerLocale("ja", ja);
setDefaultLocale("ja");
import { CacheProvider } from "@emotion/react";
import createEmotionCache from "../src/createEmotionCache";
import Script from "next/script";

Router.events.on("routeChangeStart", (url) => {
    NProgress.start();
});
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());
NProgress.configure({ showSpinner: true });
// const {getUser} = useAuth({middleware: 'guest'})

const clientSideEmotionCache = createEmotionCache();

function MyApp(props) {
    const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
    //config Language


    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                refetchOnWindowFocus: false,
                staleTime: 10 * 1000,
            },
        },
    });

    React.useEffect(() => {
        // Remove the server-side injected CSS.

        const jssStyles = document.querySelector("#jss-server-side");

        if (jssStyles) {
            jssStyles.parentElement.removeChild(jssStyles);
        }
    }, []);

  return (
    
    <CacheProvider value={emotionCache}>
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <SSRProvider>
            <CssBaseline />
              <Script type="text/javascript" src="/jquery-ui-1.13.2.custom/external/jquery/jquery.js" strategy="beforeInteractive" />
              <Script type="text/javascript" src="/jquery-ui-1.13.2.custom/jquery-ui.min.js" strategy="beforeInteractive" />
              <Component {...pageProps} />
            <ToastContainer
              position="bottom-left"
              autoClose={1000}
              hideProgressBar={true}
              newestOnTop={true}
              rtl={false}
            />
          </SSRProvider>
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </QueryClientProvider>
      </RecoilRoot>
    </CacheProvider>
  );
}

export default MyApp;

MyApp.propTypes = {
    Component: PropTypes.elementType.isRequired,
    emotionCache: PropTypes.object,
    pageProps: PropTypes.object.isRequired,
};
