// import React from "react";
import router, { useRouter } from 'next/router'
import Layout from "components/Layout";
import { withIronSessionSsr } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { User } from "pages/api/user";
import { InferGetServerSidePropsType } from "next";
import useUser from "lib/useUser";
import { PrismaClient } from '@prisma/client'
import { IncomingMessage } from "http";
import { join } from "path";

import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Divider from '@mui/material/Divider';
import React from 'react';
import MenuItem from '@mui/material/MenuItem';
import { color } from '@mui/system';
import SaveIcon from '@mui/icons-material/Save';
import LoadingButton from '@mui/lab/LoadingButton';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Stack from '@mui/material/Stack';

import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';

import Script from 'next/script'

import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { ChangeEvent, MouseEvent, useState } from "react";
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import { Input } from '@mui/icons-material';
import Fab from '@mui/material/Fab';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';


// Fetch deposit data
export const getServerSideProps = withIronSessionSsr(async function ({
  params,
  req,
  res,
}) {
  const user: any = req.session.user;

  const roleId = Number(params?.id);

  if (user === undefined) {
    res.setHeader("location", "/login");
    res.statusCode = 302;
    res.end();
    return {
      props: {
        user: { id: null, email: null, username: null, isLoggedIn: false } as User,
        role: {}
      },
    };
  }

  if (!user?.isAdmin) {
    res.setHeader("location", "/profile");
    res.statusCode = 302;
    res.end();
    return {
      props: {
        user,
        role: {}
      },
    };
  }

  if (isNaN(+roleId)) {
    return {
      props: {
        user,
        role: {}
      },
    };
  }

  const prisma = new PrismaClient()
  const role: any = await prisma.role.findFirst({
    where: {
     id: roleId,
    }
  })


  return {
    props : { user, role }
  }
}, sessionOptions);


function RolePage(
  { user, role }:
  {
    user: InferGetServerSidePropsType<typeof getServerSideProps>,
    role: any
  }
  ) {

  const booleanStatus = [
    {
      value: true,
      label: 'Ναι',
    },
    {
      value: false,
      label: 'Όχι',
    },
  ]

  const [email, setEmail] = React.useState(role.email || "");
  const [emailError, setEmailError] = React.useState("");
  const [isAdmin, setIsAdmin] = React.useState(role.is_admin || false);
  const [isSecretary, setIsSecretary] = React.useState(role.is_secretary || false);
  const [isLibrarian, setIsLibrarian] = React.useState(role.is_librarian || false);
  const [isActive, setIsActive] = React.useState(role.is_active || false);

  const [loading, setLoading] = React.useState(false);
  
  const [openSuccess, setOpenSuccess] = React.useState(false);
  const [openError, setOpenError] = React.useState(false);
  
  const [viewData, setViewData] = React.useState(JSON.stringify(role, null, 2));


  const handleCloseSuccess = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSuccess(false);
  };

  const handleCloseError = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenError(false);
  };
  // console.log(role,isAdmin,isSecretary,isLibrarian,isActive);
  async function handleClickSave() {
    setLoading(true);
    const body = {
      id: role.id,
      email,
      is_admin: isAdmin,
      is_secretary: isSecretary,
      is_librarian: isLibrarian,
      is_active: isActive,
    };
    await fetch('/api/role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }) 
    .then(response => {
      setLoading(false);
      if(!response.ok) throw new Error(response.status as unknown as string);
      return response.json();
    })
    .then((data) => {
      setOpenSuccess(true);
      setViewData(JSON.stringify(data, null, 2));
    })
    .catch(err => {
      setOpenError(true);
      console.error(err);
    });
  }

  const validateEmail = (m: string) => {
    return String(m)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  }

  const onEmailChange = (e: any) => {
  // const onEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value || "";

    // setEmail(emailValue);
    if (emailValue === "") {
      setEmailError("No email provided.");
      return;
    }
    if (emailValue.split('@')[1] !== 'hua.gr') {
      setEmailError("Invalid email.");
      return;
    }
    const validEmail = validateEmail(emailValue);
    if (validEmail === null) {
      setEmailError("Invalid email.");
      return;
    }
    setEmailError("");
    return;

  };

  React.useEffect(() => {
    onEmailChange(
      {target:
        {name: "email", value: email}
      });
  }, [email]);

  return (
    <Layout>   
      <h1>Στοιχεία ρόλου</h1>
        <div>
          <FormControl fullWidth sx={{ m: 1 }}>
            <TextField
              id="outlined-multiline-static"
              error={emailError !== ""}
              label="Ηλεκτρονική διεύθυνση ταχυδρομείου"
              helperText={emailError}
              value={email}
              // onChange={onEmailChange}
              onChange={
                (v) => { setEmail(v.target.value); }
              }
              sx={{ width: 400 }}
            />
          </FormControl>

          <Box sx={{ m: 2 }} />

          <TextField
            id="outlined-select-admin"
            select
            label="Διαχειριστής"
            value={isAdmin}
            // onChange={handleChangeConfirmed}
            onChange={
              (v) => { setIsAdmin(v.target.value.toLowerCase() === 'true'); }
            }
            sx={{ m: 1, width: 200 }}
          >
            {booleanStatus.map((option) => (
              <MenuItem key={String(option.value)} value={String(option.value)}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            id="outlined-select-secretary"
            select
            label="Γραμματεία"
            value={isSecretary}
            // onChange={handleChangeConfirmed}
            onChange={
              (v) => { setIsSecretary(v.target.value.toLowerCase() === 'true'); }
            }
            sx={{ m: 1, width: 200 }}
          >
            {booleanStatus.map((option) => (
              <MenuItem key={String(option.value)} value={String(option.value)}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            id="outlined-select-librarian"
            select
            label="Βιβλιοθηκονόμος"
            value={isLibrarian}
            // onChange={handleChangeConfirmed}
            onChange={
              (v) => { setIsLibrarian(v.target.value.toLowerCase() === 'true'); }
            }
            sx={{ m: 1, width: 200 }}
          >
            {booleanStatus.map((option) => (
              <MenuItem key={String(option.value)} value={String(option.value)}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            id="outlined-select-active"
            select
            label="Ενεργός"
            value={isActive}
            // onChange={handleChangeConfirmed}
            onChange={
              (v) => { setIsActive(v.target.value.toLowerCase() === 'true') }
            }
            sx={{ m: 1, width: 200 }}
          >
            {booleanStatus.map((option) => (
              <MenuItem key={String(option.value)} value={String(option.value)}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>




          <Box sx={{ m: 2 }} />
          
          <Box sx={{ '& > button': { m: 1 } }}>
            <LoadingButton
                color="secondary"
                disabled={emailError !== ""}
                onClick={handleClickSave}
                loading={loading}
                loadingPosition="start"
                startIcon={<SaveIcon />}
                variant="contained"
              >
                Αποθηκευση
              </LoadingButton>
          </Box>

          <Snackbar
            open={openError}
            autoHideDuration={6000}
            onClose={handleCloseError}
          >
            <Alert severity="error">
              <AlertTitle>Σφάλμα</AlertTitle>
               — <strong>Εμφανίστηκε σφάλμα κατά την αποθήκευση!</strong>
            </Alert>
          </Snackbar>

          <Snackbar
            open={openSuccess}
            autoHideDuration={6000}
            onClose={handleCloseSuccess}
          >
            <Alert severity="success">
              <AlertTitle>Επιτυχία</AlertTitle>
               — <strong>Οι αλλαγές αποθηκεύτηκαν!</strong>
            </Alert>
          </Snackbar>
      
        </div>

      {/* <pre>{viewData}</pre> */}
    </Layout>
  )
}

export default RolePage
