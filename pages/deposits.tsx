import { useRouter } from 'next/router'
import { AppProps } from 'next/app';
import Layout from "components/Layout";

import { PrismaClient } from '@prisma/client'

// Fetch all deposits
export async function getServerSideProps() {
  const prisma = new PrismaClient()
  const deposits = await prisma.deposit.findMany()

  return {
    props : { deposits }
  }

  /*console.log(Object.keys(deposits).length)
  if ((Object.keys(deposits).length > 0)) {
    return {
      props : { deposits }
    }
  } else {
    return {
      props : {  }
    }
  }*/
}

// Display list of deposits
export default (({deposits}: {deposits: any[]}) =>
  <Layout>
  <h1>Λίστα αποθέσεων</h1>
  <ul> 
   {deposits.map(deposit => (
     <li key={deposit.id}>{deposit.title}</li>
    ))}
  </ul>
  </Layout>
);





  