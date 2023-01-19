import router from 'next/router'
import Layout from "components/Layout";
import { withIronSessionSsr } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { User } from "pages/api/user";
import { InferGetServerSidePropsType } from "next";
import { PrismaClient } from '@prisma/client'
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import React from 'react';
import MenuItem from '@mui/material/MenuItem';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Snackbar from '@mui/material/Snackbar';
import { validateEmail } from 'lib/utils';

// Fetch deposit data
export const getServerSideProps = withIronSessionSsr(async function ({
  params,
  req,
  res,
}) {
  const user: User = req.session.user!;

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
  { user, role }: InferGetServerSidePropsType<typeof getServerSideProps>,
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

  const [id, setId] = React.useState<number | null>(role?.id! || null)
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

  interface Body {
    [key: string]: any;
    email: string,
    is_admin: boolean;
    is_secretary: boolean;
    is_librarian: boolean;
    is_active: boolean;
  }

  async function handleClickSave() {
    setLoading(true);
    const body: Body = {
      // id: role.id,
      email,
      is_admin: isAdmin,
      is_secretary: isSecretary,
      is_librarian: isLibrarian,
      is_active: isActive,
    };
    // add id key only when id is not null or undefined
    id && (body.id = id);
    await fetch('/api/role' + (id? ('/' + id) : ""), {
      method: id? 'PATCH' : 'POST',
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
      setId(data.id);
      setViewData(JSON.stringify(data, null, 2));
    })
    .catch(err => {
      setOpenError(true);
      console.error(err);
    });
  }

  async function handleClickDelete() {
    setLoading(true);
    await fetch('/api/role/' + id, {
      method: 'DELETE',
    }) 
    .then(response => {
      setLoading(false);
      if(!response.ok) throw new Error(response.status as unknown as string);
      return response.json();
    })
    .then((data) => {
      setOpenSuccess(true);
      router.push('/usersroles');
    })
    .catch(err => {
      setOpenError(true);
      console.error(err);
    });
  }

  React.useEffect(() => {

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

    onEmailChange(
      {target:
        {name: "email", value: email}
      });
  }, [email]);

  const deleteButton = {
    backgroundColor: '#e62e00', '&:hover': { backgroundColor: '#cc0066' }
  };

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
              <LoadingButton
                color="secondary"
                disabled={!id}
                onClick={handleClickDelete}
                loading={loading}
                loadingPosition="start"
                startIcon={<DeleteIcon />}
                variant="contained"
                sx={deleteButton}
                >
                Διαγραφή
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
