import React from "react";
import Layout from "components/Layout";
import { withIronSessionSsr } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { User } from "pages/api/user";
import { InferGetServerSidePropsType } from "next";
import { PrismaClient } from "@prisma/client"

// Fetch deposits of current user
export const getServerSideProps = withIronSessionSsr(async function ({
  req,
  res,
}) {
  const user = req.session.user;

  if (user === undefined) {
    res.setHeader("location", "/login");
    res.statusCode = 302;
    res.end();
    return {
      props: {
        user: { id: null, email: null, username: null, isLoggedIn: false } as User,
        deposits: {}
      },
    };
  }

  const prisma = new PrismaClient()
  const deposits = await prisma.deposit.findMany({
    where: {
      submitter_id: user?.id || undefined,
    }
  })

  return {
    props : { user, deposits }
  }
}, sessionOptions);

// Display list of deposits or error messages
function DepositsPage(
  { user, deposits }:
  {
    user: InferGetServerSidePropsType<typeof getServerSideProps>,
    deposits: any[]
  }
  ) {

  console.log(deposits);
  if (deposits && Object.keys(deposits).length > 0) {
    return (
      <Layout>
      <h1>Οι αποθέσεις μου</h1>
       {deposits.map(deposit => (
        <ul>
          <li key={deposit.titleEl}>title_el: {deposit.title_el}</li>
          <li key={deposit.titleEn}>title_en: {deposit.title_en}</li>
          <li key={deposit.pages}>pages: {deposit.pages}</li>
          <li key={deposit.tables}>tables: {deposit.tables}</li>
          <li key={deposit.maps}>maps: {deposit.maps}</li>
        </ul>
        ))}
      </Layout>
    )
  } else {
    return (
    <Layout>
      <h1>Οι αποθέσεις μου</h1>
      <h3>Δεν βρέθηκαν αποθέσεις</h3>
    </Layout>
    );
  }

}

export default DepositsPage;
