import React from "react";
import { useRouter } from 'next/router'
import Layout from "components/Layout";
import useUser from "lib/useUser";

function deposit() {
  const { user } = useUser({
    redirectTo: "/login",
  });

  const router = useRouter()
  const { id } = router.query
  return (
    <Layout>
    <h1>Deposit info page with id {id}</h1>
    </Layout>
  )
}

export default deposit
