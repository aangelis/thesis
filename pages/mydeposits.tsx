import React from "react";
import Layout from "components/Layout";
import Table from "components/Table";
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
  const user: any = req.session.user;

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
      submitter_id: user.id || undefined,
    }
  })

  return {
    props : { user, deposits }
  }
}, sessionOptions);

// Display list of deposits or error message
function DepositsPage(
  { user, deposits }:
  {
    user: InferGetServerSidePropsType<typeof getServerSideProps>,
    deposits: any[]
  }
  ) {

  const getHeadings = () => {
    return Object.keys(deposits[0]);
  }
  
  if (deposits && Object.keys(deposits).length > 0) {
    return (
      <Layout>
        <h1>Οι αποθέσεις μου</h1>
        <Table data={deposits}/> 
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
