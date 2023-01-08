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
import Button from "@mui/material/Button";

// info on how to use layouts
// https://nextjs.org/docs/basic-features/layouts
export default function Profile() {
  const { user } = useUser({
    redirectTo: "/login",
  });

  const isValueElValid = (str: string): boolean => {
    if (str.length === 0) {
      return true;
    }
    return (/^[ \u0370-\u03FF\u1F00-\u1FFF]*$/.test(str));
  }

  const isValueEnValid = (str: string): boolean => {
    if (str.length === 0) {
      return true;
    }
    return (/^[ A-Za-z]*$/.test(str));
  }

  const stringToBoolean = (s: string | null | undefined): boolean => {
    return !!s
  }

  const [nameEl, setNameEl] = React.useState(user?.name_el || "")
  const [nameEn, setNameEn] = React.useState(user?.name_en || "")
  const [surnameEl, setSurnameEl] = React.useState(user?.surname_el || "")
  const [surnameEn, setSurnameEn] = React.useState(user?.surname_en || "")
  const [fatherNameEl, setFatherNameEl] = React.useState(user?.father_name_el || "")
  const [fatherNameEn, setFatherNameEn] = React.useState(user?.father_name_en || "")

  const [nameElValid, setNameElValid] = React.useState(isValueElValid(user?.name_el || ""));
  const [nameEnValid, setNameEnValid] = React.useState(isValueEnValid(user?.name_en || ""));
  const [surnameElValid, setSurnameElValid] = React.useState(isValueElValid(user?.surname_el || ""));
  const [surnameEnValid, setSurnameEnValid] = React.useState(isValueEnValid(user?.surname_en || ""));
  const [fatherNameElValid, setFatherNameElValid] = React.useState(isValueElValid(user?.father_name_el || ""));
  const [fatherNameEnValid, setFatherNameEnValid] = React.useState(isValueEnValid(user?.father_name_en || ""));
  const [fieldsValid, setFieldsValid] = React.useState<boolean>(
    stringToBoolean(user?.name_el) && 
    stringToBoolean(user?.name_en) && 
    stringToBoolean(user?.surname_el) && 
    stringToBoolean(user?.surname_en) && 
    stringToBoolean(user?.father_name_el) &&
    stringToBoolean(user?.father_name_en)
  );
  const [profileCompleted, setProfileCompleted] = React.useState<boolean>(
    stringToBoolean(user?.name_el) && 
    stringToBoolean(user?.name_en) && 
    stringToBoolean(user?.surname_el) && 
    stringToBoolean(user?.surname_en) && 
    stringToBoolean(user?.father_name_el) &&
    stringToBoolean(user?.father_name_en)
  );
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
    // Remove spaces and commas at the end and beginning
    setNameEl(nameEl.replace(/^[,\s]+|[,\s]+$/g, ''));
    setNameEn(nameEn.replace(/^[,\s]+|[,\s]+$/g, ''));
    setSurnameEl(surnameEl.replace(/^[,\s]+|[,\s]+$/g, ''));
    setSurnameEn(surnameEn.replace(/^[,\s]+|[,\s]+$/g, ''));
    setFatherNameEl(fatherNameEl.replace(/^[,\s]+|[,\s]+$/g, ''));
    setFatherNameEn(fatherNameEn.replace(/^[,\s]+|[,\s]+$/g, ''));
    const body = {
      // Remove spaces and commas at the end and beginning (async useState)
      name_el: nameEl.replace(/^[,\s]+|[,\s]+$/g, ''),
      name_en: nameEn.replace(/^[,\s]+|[,\s]+$/g, ''),
      surname_el: surnameEl.replace(/^[,\s]+|[,\s]+$/g, ''),
      surname_en: surnameEn.replace(/^[,\s]+|[,\s]+$/g, ''),
      father_name_el: fatherNameEl.replace(/^[,\s]+|[,\s]+$/g, ''),
      father_name_en: fatherNameEn.replace(/^[,\s]+|[,\s]+$/g, ''),
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
      setProfileCompleted(
        stringToBoolean(data.name_el) && 
        stringToBoolean(data.name_en) && 
        stringToBoolean(data.surname_el) && 
        stringToBoolean(data.surname_en) && 
        stringToBoolean(data.father_name_el) &&
        stringToBoolean(data.father_name_en)
      );
      // setViewData(JSON.stringify(data, null, 2));
    })
    .catch(err => {
      setOpenError(true);
      console.error(err);
    });
  }
  
  function normalizeText(text: string) {
    const words = text.split(" ");
    const wordsCount = words.length;
    
    for (let i = 0; i <wordsCount; i++) {
      if (words[i]) {
        words[i] = words[i][0].toUpperCase() + words[i].substring(1).toLowerCase();
      }
    }
    
    if (wordsCount > 1 && words[wordsCount - 1] === '') {
      words[wordsCount - 2] = words[wordsCount - 2].slice(0, -1).replace(/[ς]/g, 'σ') + words[wordsCount - 2].slice(-1).replace(/[σ]/g, 'ς')
    }
    return words.join(' ');
  }

  React.useEffect(() => {
    setFieldsValid(
      isValueElValid(nameEl) && 
      isValueEnValid(nameEn) && 
      isValueElValid(surnameEl) && 
      isValueEnValid(surnameEn) && 
      isValueElValid(fatherNameEl) &&
      isValueEnValid(fatherNameEn) &&
      stringToBoolean(nameEl) && 
      stringToBoolean(nameEn) && 
      stringToBoolean(surnameEl) && 
      stringToBoolean(surnameEn) && 
      stringToBoolean(fatherNameEl) &&
      stringToBoolean(fatherNameEn)
    );
  }, [nameEl, nameEl, surnameEl, surnameEn, fatherNameEl, fatherNameEn])

  if (!user?.isLoggedIn)
    return(<></>)



  return (
    <Layout>
      <h1>Προφίλ</h1>

      <Box sx={{ '& > button': { m: 1 } }}>
        { !user.is_superuser && (
          <Button sx={{ m: 1 }} variant="contained" href="#contained-buttons">
            δημιουργος
          </Button>
        )}
        { user.isSecretary && (
          <Button sx={{ m: 1 }} variant="contained" href="#contained-buttons">
            Προσωπικο Γραμματειας
          </Button>
        )}
        { user.isLibrarian && (
          <Button sx={{ m: 1 }} variant="contained" href="#contained-buttons">
            Βιβλιοθηκονομος
          </Button>
        )}
        { user.isAdmin && (
          <Button sx={{ m: 1 }} variant="contained" href="#contained-buttons">
            Διαχειριστης
          </Button>
        )}
      </Box>

      { !user.is_superuser && !profileCompleted && ( 

        <Alert severity="warning" sx={{ m: 1 }}>
          <AlertTitle>Προσοχή!</AlertTitle>
            Για να έχετε δικαίωμα δημιουργίας νέας απόθεσης
            απαιτείται η συμπλήρωση <strong>όλων των πεδίων</strong> που περιλαμβάνει το προφίλ.
        </Alert>

      )}
 
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
          error={!nameElValid}
          label="Όνομα (Ελληνικά)"
          helperText={!nameElValid && "Επιτρέπονται μόνο ελληνικοί χαρακτήρες"}
          value={nameEl}
          onChange={
            (v) => { 
              setNameElValid(isValueElValid(v.target.value));
              setNameEl(normalizeText(v.target.value));
            }
          }
          sx={{ width: 400 }}
        />
      </FormControl>

      <Box sx={{ m: 2 }} />

      <FormControl fullWidth sx={{ m: 1 }}>
        <TextField
          id="outlined-multiline-static"
          error={!nameEnValid}
          label="Όνομα (Αγγλικά)"
          helperText={!nameEnValid && "Επιτρέπονται μόνο λατινικοί χαρακτήρες"}
          value={nameEn}
          onChange={
            (v) => { 
              setNameEnValid(isValueEnValid(v.target.value));
              setNameEn(normalizeText(v.target.value));
            }
          }
          sx={{ width: 400 }}
        />
      </FormControl>

      <Box sx={{ m: 2 }} />

      <FormControl fullWidth sx={{ m: 1 }}>
        <TextField
          id="outlined-multiline-static"
          error={!surnameElValid}
          label="Επίθετο (Ελληνικά)"
          helperText={!surnameElValid && "Επιτρέπονται μόνο ελληνικοί χαρακτήρες"}
          value={surnameEl}
          onChange={
            (v) => { 
              setSurnameElValid(isValueElValid(v.target.value));
              setSurnameEl(normalizeText(v.target.value));
            }
          }
          sx={{ width: 400 }}
        />
      </FormControl>

      <Box sx={{ m: 2 }} />

      <FormControl fullWidth sx={{ m: 1 }}>
        <TextField
          id="outlined-multiline-static"
          error={!surnameEnValid}
          label="Επίθετο (Αγγλικά)"
          helperText={!surnameEnValid && "Επιτρέπονται μόνο λατινικοί χαρακτήρες"}
          value={surnameEn}
          onChange={
            (v) => { 
              setSurnameEnValid(isValueEnValid(v.target.value));
              setSurnameEn(normalizeText(v.target.value)); 
            }
          }
          sx={{ width: 400 }}
        />
      </FormControl>

      <Box sx={{ m: 2 }} />

      <FormControl fullWidth sx={{ m: 1 }}>
        <TextField
          id="outlined-multiline-static"
          error={!fatherNameElValid}
          label="Όνομα πατέρα (Ελληνικά)"
          helperText={!fatherNameElValid && "Επιτρέπονται μόνο ελληνικοί χαρακτήρες"}
          value={fatherNameEl}
          onChange={
            (v) => { 
              setFatherNameElValid(isValueElValid(v.target.value));
              setFatherNameEl(normalizeText(v.target.value)); 
            }
          }
          sx={{ width: 400 }}
        />
      </FormControl>

      <Box sx={{ m: 2 }} />

      <FormControl fullWidth sx={{ m: 1 }}>
        <TextField
          id="outlined-multiline-static"
          error={!fatherNameEnValid}
          label="Όνομα πατέρα (Αγγλικά)"
          helperText={!fatherNameEnValid && "Επιτρέπονται μόνο λατινικοί χαρακτήρες"}
          value={fatherNameEn}
          onChange={
            (v) => { 
              setFatherNameEnValid(isValueEnValid(v.target.value));
              setFatherNameEn(normalizeText(v.target.value)); 
            }
          }
          sx={{ width: 400 }}
        />
      </FormControl>

      <Box sx={{ m: 2 }} />

      <Box sx={{ '& > button': { m: 1 } }}>
        <LoadingButton
          color="secondary"
          disabled={!fieldsValid}
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