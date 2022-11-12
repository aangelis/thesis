import { useRouter } from 'next/router'
import { AppProps } from 'next/app';
import Layout from "components/Layout";
import { PrismaClient } from '@prisma/client'
import { withIronSessionApiRoute } from "iron-session/next";
import { withIronSessionSsr } from "iron-session/next";
import { sessionOptions } from "lib/session";
import useUser from "lib/useUser";

// Fetch all deposits
export const getServerSideProps = withIronSessionSsr(async function ({
  req,
  res,
}) {
  const user: any = req.session.user;

  if (!user.isAdmin) {
    res.setHeader("location", "/mydeposits");
    res.statusCode = 302;
    res.end();
    return {
      props: {
        deposits: {}
      },
    };
  }

  if (user === undefined) {
    res.setHeader("location", "/login");
    res.statusCode = 302;
    res.end();
    return {
      props: {
        deposits: {}
      },
    };
  }

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
}, sessionOptions);

// Display list of deposits
export default (({deposits}: {deposits: any[]}) => {
  const { user } = useUser({
    // redirectTo: "/login",
  });

  if (user?.isAdmin)
    return (
      <Layout>
      <h1>Λίστα αποθέσεων</h1>
      <ul> 
      {deposits.map(deposit => (
        <li key={deposit.id}>{deposit.title}</li>
        ))}
      </ul>
      </Layout>)
  
  return (<></>)

  }
);





  