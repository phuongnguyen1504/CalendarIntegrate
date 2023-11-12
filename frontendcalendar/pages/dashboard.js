import Head from "next/head";
import Card from "../components/Card/Card";
import { useGroup } from "../hooks/group";
import i18n from "../lib/Language";

export default function Dashboad() {
  const { getGroup, group, updateGroup, deleteGroup, createGroup } = useGroup({
    middleware: "guest",
  });
  const groups = group();

  return (
    <>
      <Head>
        <title>{i18n.t("dashboard.headTitle")}</title>
        <meta name="description" content="" />
        
      </Head>
        <main className={"main"}>
          <div className={"container"}>
            <Card button={"Access"} title={i18n.t("dashboard.title")} data={groups} />
          </div>
        </main>
    </>
  );
}
