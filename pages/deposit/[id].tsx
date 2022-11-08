// import React from "react";
import { useRouter } from 'next/router'
import Layout from "components/Layout";
import { withIronSessionSsr } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { User } from "pages/api/user";
import { InferGetServerSidePropsType } from "next";
import useUser from "lib/useUser";
import { PrismaClient } from '@prisma/client'
import { IncomingMessage } from "http";
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Divider from '@mui/material/Divider';
import React from 'react';
import MenuItem from '@mui/material/MenuItem';


// Fetch deposit data
export const getServerSideProps = withIronSessionSsr(async function ({
  req,
  res,
}) {
  const user: any = req.session.user;

  // https://github.com/aralroca/next-translate/issues/694#issuecomment-974717129
  // Get id property of request data
  const NextRequestMetaSymbol = Reflect.ownKeys(req).find(key => key.toString() === 'Symbol(NextRequestMeta)');
  // const params = NextRequestMetaSymbol && req[NextRequestMetaSymbol].__NEXT_INIT_QUERY ? req[NextRequestMetaSymbol].__NEXT_INIT_QUERY : undefined
  // const depositId = Number(params.id);
  const params = NextRequestMetaSymbol && req[NextRequestMetaSymbol].__NEXT_INIT_URL ? req[NextRequestMetaSymbol].__NEXT_INIT_URL : undefined
  const depositId = Number(params.split('/')[params.split('/').length-1]);

  // console.log(req)
  // console.log(params);
  // console.log(depositId);
  // console.log(typeof depositId);

  if (user === undefined) {
    res.setHeader("location", "/login");
    res.statusCode = 302;
    res.end();
    return {
      props: {
        user: { id: null, email: null, username: null, isLoggedIn: false } as User,
        deposit: {}
      },
    };
  }

  if (typeof depositId !== 'number') {
    return {
      props: {
        user: {},
        deposit: {}
      },
    };
  }

  const prisma = new PrismaClient()
  const deposit: any = await prisma.deposit.findFirst({
    where: {
     id: depositId,
     submitter_id: user.id,
    }
  })

  return {
    props : { user, deposit }
  }
}, sessionOptions);


function DepositPage(
  { user, deposit }:
  {
    user: InferGetServerSidePropsType<typeof getServerSideProps>,
    deposit: any
  }
  ) {


  const confirmationStatus = [
    {
      value: 'true',
      label: 'Ναι',
    },
    {
      value: 'false',
      label: 'Όχι',
    },
  ]

  const [confirmation, setConfirmation] = React.useState(deposit.confirmed);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmation(event.target.value);
  };
  
  return (
    <Layout>
      
      
      <h1>Στοιχεία απόθεσης</h1>
        
        <div>


          <FormControl fullWidth sx={{ m: 1 }}>
            <TextField
              id="outlined-multiline-static"
              label="Τίτλος"
              multiline
              rows={2}
              defaultValue={deposit.title_el}
            />
          </FormControl>
          <FormControl fullWidth sx={{ m: 1 }}>
            <TextField
              id="outlined-multiline-static"
              label="Τίτλος (Αγγλικά)"
              multiline
              rows={2}
              defaultValue={deposit.title_en}
            />
          </FormControl>
          <Box sx={{ m: 2 }} />
          <FormControl fullWidth sx={{ m: 1 }}>
            <TextField
              id="outlined-multiline-static"
              label="Περίληψη"
              multiline
              rows={4}
              defaultValue={deposit.abstract_el}
            />
          </FormControl>
          <FormControl fullWidth sx={{ m: 1 }}>
            <TextField
              id="outlined-multiline-static"
              label="Περίληψη (Αγγλικά)"
              multiline
              rows={4}
              defaultValue={deposit.abstract_en}
            />
          </FormControl>
          <Box sx={{ m: 2 }} />
          <Box
            component="form"
            sx={{
              '& .MuiTextField-root': { m: 1, width: '25ch' },
            }}
            noValidate
            autoComplete="off"
          >
            <div>
              <TextField id="outlined-basic" label="Σελίδες" variant="outlined" defaultValue={deposit.pages} />
              <TextField id="outlined-basic" label="Εικόνες" variant="outlined" defaultValue={deposit.images} />
              <TextField id="outlined-basic" label="Πίνακες" variant="outlined" defaultValue={deposit.tables} />
            </div>
            <div>
              <TextField id="outlined-basic" label="Διαγράμματα" variant="outlined" defaultValue={deposit.diagrams} />
              <TextField id="outlined-basic" label="Χάρτες" variant="outlined" defaultValue={deposit.maps} />
              <TextField id="outlined-basic" label="Σχέδια" variant="outlined" defaultValue={deposit.drawings} />
            </div>
          </Box>
          <Box sx={{ m: 2 }} />
          <Box
            component="form"
            sx={{
              '& .MuiTextField-root': { m: 1, width: '25ch' },
            }}
            noValidate
            autoComplete="off"
          >
            <div>
              <TextField
                id="outlined-select-confirmation"
                select
                label="Επικυρωμένη"
                value={confirmation}
                onChange={handleChange}
              >
                {confirmationStatus.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField disabled id="outlined-disabled" label="Ημερομηνία επικύρωσης" variant="outlined" defaultValue={deposit.confirmed_timestamp === null ? "Δεν υπάρχει" : deposit.confirmed_timestamp} />
            </div>
          </Box>
          <Box sx={{ m: 2 }} />
          <FormControl fullWidth sx={{ m: 1 }}>
            <TextField
              id="outlined-multiline-static"
              label="Άδεια"
              multiline
              rows={2}
              defaultValue={deposit.license}
            />
          </FormControl>
          <FormControl fullWidth sx={{ m: 1 }}>
            <TextField
              id="outlined-multiline-static"
              label="Σχόλια"
              multiline
              rows={3}
              defaultValue={deposit.comments}
            />
          </FormControl>
          <Box sx={{ m: 2 }} />
          <FormControl fullWidth sx={{ m: 1 }}>
            <TextField id="outlined-basic" label="Επιβλέπων" variant="outlined" defaultValue={deposit.supervisor} />
          </FormControl>


      </div>
      

      

    

    <pre>{JSON.stringify(deposit, null, 2)}</pre>
    </Layout>
  )
}

export default DepositPage
