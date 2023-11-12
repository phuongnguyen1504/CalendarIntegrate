import Document, { Html, Head, Main, NextScript } from "next/document";
import { ServerStyleSheet } from "styled-components";
import createEmotionServer from "@emotion/server/create-instance";
import createEmotionCache from "../src/createEmotionCache";

const GA_TRACKING_ID = process.env.REACT_GA_TRACKING_ID;

export default class MyDocument extends Document {
    static async getInitialProps(ctx) {
        const sheet = new ServerStyleSheet();
        const originalRenderPage = ctx.renderPage;

        try {
            ctx.renderPage = () =>
                originalRenderPage({
                    enhanceApp: (App) => (props) =>
                        sheet.collectStyles(<App {...props} />),
                });

            const initialProps = await Document.getInitialProps(ctx);
            return {
                ...initialProps,
                styles: (
                    <>
                        {initialProps.styles}
                        {sheet.getStyleElement()}
                    </>
                ),
            };
        } finally {
            sheet.seal();
        }
    }

    render() {
        return (
            <Html>
                <Head>
                    {/* Favicon */}
                    <link rel="icon" href="/favicon.ico" />
                    {/* Main CSS */}
                    <link rel="stylesheet" type="text/css" href="/css/styles.css" />

                    {/* jQuery UI */}
                    <link rel="stylesheet" type="text/css" href="/jquery-ui-1.13.2.custom/jquery-ui.min.css" />
                    {/* <script src="/jquery-ui-1.13.2.custom/external/jquery/jquery.js" />
                    <script src="/jquery-ui-1.13.2.custom/jquery-ui.min.js" /> */}
                    {/* NProgress */}
                    <link rel="stylesheet" type="text/css" href="/css/nprogress.css" />
                    {/* Global Site Tag (gtag.js) - Google Analytics */}
                    <link rel="shortcut icon" href="/image/favicon.jpg"></link>

                    <script
                        async
                        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
                    />
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${GA_TRACKING_ID}', { page_path: window.location.pathname});`,
                        }}
                    />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

MyDocument.getInitialProps = async (ctx) => {
    const originalRenderPage = ctx.renderPage;

    // You can consider sharing the same emotion cache between
    // all the SSR requests to speed up performance.
    // However, be aware that it can have global side effects.

    const cache = createEmotionCache();
    const { extractCriticalToChunks } = createEmotionServer(cache);

    ctx.renderPage = () =>
        originalRenderPage({
            enhanceApp: (App) =>
                function EnhanceApp(props) {
                    return <App emotionCache={cache} {...props} />;
                },
        });

    const initialProps = await Document.getInitialProps(ctx);

    // This is important. It prevents emotion to render invalid HTML.
    // See
    // https://github.com/mui-org/material-ui/issues/26561#issuecomment-855286153

    const emotionStyles = extractCriticalToChunks(initialProps.html);
    const emotionStyleTags = emotionStyles.styles.map((style) => (
        <style
            data-emotion={`${style.key} ${style.ids.join(" ")}`}
            key={style.key}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: style.css }}
        />
    ));

    return {
        ...initialProps,
        emotionStyleTags,
    };
};
