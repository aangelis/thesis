import React from "react";
import Layout from "components/Layout";
import useUser from "lib/useUser";

import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import SaveIcon from '@mui/icons-material/Save';
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Snackbar from '@mui/material/Snackbar';

// info on how to use layouts
// https://nextjs.org/docs/basic-features/layouts
export default function Profile() {
  const { user } = useUser({
    redirectTo: "/login",
  });
  
  const [nameEl, setNameEl] = React.useState(user.name_el)
  const [nameEn, setNameEn] = React.useState(user.name_en)
  const [surnameEl, setSurnameEl] = React.useState(user.surname_el)
  const [surnameEn, setSurnameEn] = React.useState(user.surname_en)
  const [fatherNameEl, setFatherNameEl] = React.useState(user.father_name_el)
  const [fatherNameEn, setFatherNameEn] = React.useState(user.father_name_en)

  const [loading, setLoading] = React.useState(false);
  const [openSuccess, setOpenSuccess] = React.useState(false);
  const [openError, setOpenError] = React.useState(false);

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
  
  async function handleClickSave() {
    setLoading(true);
    const body = {
      name_el: nameEl,
      name_en: nameEn,
      surname_el: surnameEl,
      surname_en: surnameEn,
      father_name_el: fatherNameEl,
      father_name_en: fatherNameEn,
    };
    await fetch('/api/profile', {
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
      // setViewData(JSON.stringify(data, null, 2));
    })
    .catch(err => {
      setOpenError(true);
      console.error(err);
    });
  }
  

  if (!user?.isLoggedIn)
    return(<></>)

  return (
    <Layout>
      <h1>Προφίλ</h1>

      <FormControl fullWidth sx={{ m: 1 }}>
        <TextField
          disabled
          id="outlined-multiline-static"
          label="Ηλεκτρονική διεύθυνση ταχυδρομείου"
          value={user.email}
          sx={{ width: 400 }}
          />
      </FormControl>

      <Box sx={{ m: 2 }} />
      
      <FormControl fullWidth sx={{ m: 1 }}>
        <TextField
          disabled
          id="outlined-multiline-static"
          label="Όνομα χρήστη"
          value={user.username}
          sx={{ width: 400 }}
        />
      </FormControl>

      <Box sx={{ m: 2 }} />
      
      <FormControl fullWidth sx={{ m: 1 }}>
        <TextField
          disabled
          id="outlined-multiline-static"
          label="Όνομα"
          value={user.first_name}
          sx={{ width: 400 }}
        />
      </FormControl>

      <Box sx={{ m: 2 }} />

      <FormControl fullWidth sx={{ m: 1 }}>
        <TextField
          disabled
          id="outlined-multiline-static"
          label="Επίθετο"
          value={user.last_name}
          sx={{ width: 400 }}
        />
      </FormControl>

      <Box sx={{ m: 2 }} />
      
      <FormControl fullWidth sx={{ m: 1 }}>
        <TextField
          disabled
          id="outlined-multiline-static"
          label="Τίτλος"
          value={user.title}
          sx={{ width: 400 }}
        />
      </FormControl>

      <Box sx={{ m: 2 }} />

      <FormControl fullWidth sx={{ m: 1 }}>
        <TextField
          disabled
          id="outlined-multiline-static"
          label="Τμήμα"
          value={user.department}
          sx={{ width: 400 }}
        />
      </FormControl>

      <Box sx={{ m: 2 }} />

      <FormControl fullWidth sx={{ m: 1 }}>
        <TextField
          id="outlined-multiline-static"
          label="Όνομα (Ελληνικά)"
          value={nameEl}
          onChange={
            (v) => { setNameEl(v.target.value); }
          }
          sx={{ width: 400 }}
        />
      </FormControl>

      <Box sx={{ m: 2 }} />

      <FormControl fullWidth sx={{ m: 1 }}>
        <TextField
          id="outlined-multiline-static"
          label="Όνομα (Αγγλικά)"
          value={nameEn}
          onChange={
            (v) => { setNameEn(v.target.value); }
          }
          sx={{ width: 400 }}
        />
      </FormControl>

      <Box sx={{ m: 2 }} />

      <FormControl fullWidth sx={{ m: 1 }}>
        <TextField
          id="outlined-multiline-static"
          label="Επίθετο (Ελληνικά)"
          value={surnameEl}
          onChange={
            (v) => { setSurnameEl(v.target.value); }
          }
          sx={{ width: 400 }}
        />
      </FormControl>

      <Box sx={{ m: 2 }} />

      <FormControl fullWidth sx={{ m: 1 }}>
        <TextField
          id="outlined-multiline-static"
          label="Επίθετο (Αγγλικά)"
          value={surnameEn}
          onChange={
            (v) => { setSurnameEn(v.target.value); }
          }
          sx={{ width: 400 }}
        />
      </FormControl>

      <Box sx={{ m: 2 }} />

      <FormControl fullWidth sx={{ m: 1 }}>
        <TextField
          id="outlined-multiline-static"
          label="Όνομα πατέρα (Ελληνικά)"
          value={fatherNameEl}
          onChange={
            (v) => { setFatherNameEl(v.target.value); }
          }
          sx={{ width: 400 }}
        />
      </FormControl>

      <Box sx={{ m: 2 }} />

      <FormControl fullWidth sx={{ m: 1 }}>
        <TextField
          id="outlined-multiline-static"
          label="Όνομα πατέρα (Αγγλικά)"
          value={fatherNameEn}
          onChange={
            (v) => { setFatherNameEn(v.target.value); }
          }
          sx={{ width: 400 }}
        />
      </FormControl>

      <Box sx={{ m: 2 }} />

      <Box sx={{ '& > button': { m: 1 } }}>
        <LoadingButton
          color="secondary"
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

      
      {/* <pre>{JSON.stringify(user, null, 2)}</pre> */}


    </Layout>
  );
}