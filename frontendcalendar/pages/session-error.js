import Head from "next/head";
import TokenError from "../components/TokenError";
import i18n from "../lib/Language";

export default function Index({ index }) {
  return (
    <>
      <Head>
        <title>{i18n.t("scheduleBoard.headTitle")}</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TokenError />
    </>
  );
}
