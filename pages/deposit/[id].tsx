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
import { color } from '@mui/system';
import SaveIcon from '@mui/icons-material/Save';
import LoadingButton from '@mui/lab/LoadingButton';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Stack from '@mui/material/Stack';

import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

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
  const split = params.split('/')[params.split('/').length-1];
  const depositId = Number(split.split('.')[0]);

  // on link
  // http://localhost:3000/_next/data/development/deposit/9.json?id=9
  // on refresh
  // http://localhost:3000/deposit/9

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

  if (isNaN(+depositId)) {
    return {
      props: {
        user,
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
  // const [title_el, setTitle_el] = React.useState(deposit.title_el || "");
  // const [title_en, setTitle_en] = React.useState(deposit.title_en || "");
  const [abstract_el, setAbstract_el] = React.useState(deposit.abstract_el || "");
  const [abstract_en, setAbstract_en] = React.useState(deposit.abstract_en || "");
  const [confirmed, setConfirmed] = React.useState(deposit.confirmed || false);
  const [confirmed_timestamp, setConfirmed_timestamp] = React.useState(deposit.confirmed_timestamp);
  const [license, setLicense] = React.useState(deposit.license || "");
  const [comments, setComments] = React.useState(deposit.comments || "");
  const [supervisor, setSupervisor] = React.useState(deposit.supervisor || "");
  
  const [loading, setLoading] = React.useState(false);
  const [numFieldsErrors, setNumFieldsErrors] = React.useState(0)
  const [textFieldsErrors, setTextFieldsErrors] = React.useState(0) 
  const [openSuccess, setOpenSuccess] = React.useState(false)
  const [openUploadSuccess, setOpenUploadSuccess] = React.useState(false)
  const [openError, setOpenError] = React.useState(false)
  const [openFileError, setOpenFileError] = React.useState("")
  
  // first version of error checking for pages field
  //
  // const [pages, setPages] = React.useState(deposit.pages || "");
  // const [pagesError, setPagesError] = React.useState("");
  // const [images, setImages] = React.useState(deposit.images || "");
  // const [tables, setTables] = React.useState(deposit.tables || "");
  // const [diagrams, setDiagrams] = React.useState(deposit.diagrams || "");
  // const [maps, setMaps] = React.useState(deposit.maps || "");
  // const [drawings, setDrawings] = React.useState(deposit.drawings || "");
  // React.useEffect(() => {
  //   if (Number(pages) >= 0 && pages !== "" && pagesError !== "") {
  //     setPagesError("");
  //   }
  //   if ((Number(pages) < 0 || pages === "") && pagesError === "") {
  //     setPagesError("Positive number needed!");
  //   }
  // }, [pages, pagesError]);

  const alphabeticalFields = [
    {name: "title_el", value: deposit.title_el || "", error: "" },
    {name: "title_en", value: deposit.title_en || "", error: "" },
  ]

  const [textFields, setTextFields] = React.useState(alphabeticalFields);

  const handleTextFields = (e: any) => {
    const result = textFields.map((el) => {
      setTextFieldsErrors(0);
      if (el.name === e.target.name) {
        el.value = e.target.value;
      }
      if (el.value === "") {
        setTextFieldsErrors(textFieldsErrors + 1);
      }
      if (el.name === e.target.name && el.value === "") {
        el.error = "Cannot left blank!";
      }
      if (el.name === e.target.name && el.value !== "") {
        el.error = "";
      }
      return el;
    });
    setTextFields(result);
  }

  const numericalFields = [
    {name: "pages", value: deposit.pages || 0, error: "" },
    {name: "images", value: deposit.images || 0, error: "" },
    {name: "tables", value: deposit.tables || 0, error: "" },
    {name: "diagrams", value: deposit.diagrams || 0, error: "" },
    {name: "maps", value: deposit.maps || 0, error: "" },
    {name: "drawings", value: deposit.drawings || 0, error: "" }
  ]

  const [numFields, setNumFields] = React.useState(numericalFields);

  const handleNumFields = (e: any) => {
    const result = numFields.map((el) => {
      if (el.name === e.target.name) {
        el.value = e.target.value;
        if (Number(el.value) >= 0
            && el.value !== "" && el.error !== "") {
          el.error = "";
          setNumFieldsErrors(numFieldsErrors - 1);
        }
        if ((Number(el.value) < 0 || isNaN(+el.value) || el.value === "")
            && el.error === "") {
          el.error = "Positive number needed!";
          setNumFieldsErrors(numFieldsErrors + 1);
        }
      }
      return el;
    });
    setNumFields(result);
  };
  // React.useEffect(() => {
  // }, [numFields]);

  const handleCloseSuccess = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSuccess(false);
  };

  const handleCloseUploadSuccess = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenUploadSuccess(false);
  };

  const handleCloseError = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenError(false);
  };

  const handleCloseFileError = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenFileError("");
  };

  const handleChangeConfirmed = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmed(event.target.value);
  };
  
  const [viewData, setViewData] = React.useState(JSON.stringify(deposit, null, 2));

  async function handleClickSave() {
    setLoading(true);
    const body = {
      id: deposit.id,
      title_el: textFields.find(o => o.name === "title_el")?.value,
      title_en: textFields.find(o => o.name === "title_en")?.value,
      abstract_el,
      abstract_en,
      pages: Number(numFields.find(o => o.name === "pages")?.value),
      images: Number(numFields.find(o => o.name === "images")?.value),
      tables: Number(numFields.find(o => o.name === "tables")?.value),
      diagrams: Number(numFields.find(o => o.name === "diagrams")?.value),
      maps: Number(numFields.find(o => o.name === "maps")?.value),
      drawings: Number(numFields.find(o => o.name === "drawings")?.value),
      confirmed,
      confirmed_timestamp,
      license,
      comments,
      supervisor,
    };
    await fetch('/api/deposit', {
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

  React.useEffect(() => {
    handleTextFields(
      {target:
        {name: "title_el", value: textFields.find(o => o.name === "title_el")?.value}
      });
    handleTextFields(
      {target:
        {name: "title_en", value: textFields.find(o => o.name === "title_en")?.value}
    });
  }, [])




  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const onFileUploadChange = (e: ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target;

    if (!fileInput.files) {
      alert("No file was chosen");
      console.log("No file was chosen");
      return;
    }

    if (!fileInput.files || fileInput.files.length === 0) {
      alert("Files list is empty");
      console.log("Files list is empty");
      return;
    }

    const file = fileInput.files[0];
    /** File validation */
    if (file.type !== "application/pdf") {
      /** Reset file input */
      e.currentTarget.type = "text";
      e.currentTarget.type = "file";

      setOpenFileError("Επιλέξτε ένα έγκυρο αρχείο pdf!");
      return;
    }

    // Setting file state
    // file state, to send it later to the server
    setFile(file);
    // previewUrl state, to show the preview of the file
    setPreviewUrl(URL.createObjectURL(file));

  };

  const onCancelFile = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!previewUrl && !file) {
      return;
    }

    setFile(null);
    setPreviewUrl(null);
  };

  const onUploadFile = async (e: MouseEvent<HTMLButtonElement>) => {
  // const onUploadFile = async () => {
    e.preventDefault();
    setLoading(true);

    if (!file) {
      return;
    }

    try {
      var formData = new FormData();
      formData.append("depositId", deposit.id);
      formData.append("media", file);

      
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const {
        data,
        error,
      }: {
        data: {
          url: string | string[];
        } | null;
        error: string | null;
      } = await res.json();

      if (error || !data) {
        setOpenFileError("Κάτι δεν πήγε καλά!");
        // alert(error || "Sorry! something went wrong.");
        return;
      }

      setLoading(false);
      setOpenUploadSuccess(true);
      // console.log("File was uploaded successfylly:", data);
    } catch (error) {
      setLoading(false);
      console.error(error);
      setOpenFileError("Κάτι δεν πήγε καλά!");
      // alert("Sorry! something went wrong.");
    }
  };



  return (
    <Layout>   
      <h1>Στοιχεία απόθεσης</h1>  
        <div>
          <FormControl fullWidth sx={{ m: 1 }}>
            <TextField
              id="outlined-multiline-static"
              error={textFields.find(o => o.name === "title_el")?.error !== ""}
              label="Τίτλος"
              name="title_el"
              helperText={textFields.find(o => o.name === "title_el")?.error}
              multiline
              rows={2}
              value={textFields.find(o => o.name === "title_el")?.value}
              onChange={(v) => {
                // setTitle_el(v.target.value);
                handleTextFields(v);
              }}
            />
          </FormControl>
          <FormControl fullWidth sx={{ m: 1 }}>
            <TextField
              id="outlined-multiline-static"
              error={textFields.find(o => o.name === "title_en")?.error !== ""}
              label="Τίτλος (Αγγλικά)"
              name="title_en"
              helperText={textFields.find(o => o.name === "title_en")?.error}
              multiline
              rows={2}
              value={textFields.find(o => o.name === "title_en")?.value}
              onChange={(v) => {
                // setTitle_en(v.target.value);
                handleTextFields(v);
              }}
            />
          </FormControl>
          <Box sx={{ m: 2 }} />
          <FormControl fullWidth sx={{ m: 1 }}>
            <TextField
              id="outlined-multiline-static"
              label="Περίληψη"
              multiline
              rows={4}
              value={abstract_el}
              onChange={(v) => {
                setAbstract_el(v.target.value);
              }}
            />
          </FormControl>
          <FormControl fullWidth sx={{ m: 1 }}>
            <TextField
              id="outlined-multiline-static"
              label="Περίληψη (Αγγλικά)"
              multiline
              rows={4}
              value={abstract_en}
              onChange={(v) => {
                setAbstract_en(v.target.value);
              }}
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
              <TextField
                id="outlined-basic"
                error={numFields.find(o => o.name === "pages")?.error !== ""}
                label="Σελίδες"
                name="pages"
                variant="outlined"
                helperText={numFields.find(o => o.name === "pages")?.error}
                value={numFields.find(o => o.name === "pages")?.value}
                onChange={(v) => {
                  handleNumFields(v);
                }}
              />
              {/* <TextField
                id="outlined-basic"
                label="Εικόνες"
                variant="outlined"
                value={images}
                onChange={(v) => {
                  setImages(v.target.value);
                }}
              /> */}
              <TextField
                id="outlined-basic"
                error={numFields.find(o => o.name === "images")?.error !== ""}
                label="Εικόνες"
                name="images"
                variant="outlined"
                helperText={numFields.find(o => o.name === "images")?.error}
                value={numFields.find(o => o.name === "images")?.value}
                onChange={(v) => {
                  handleNumFields(v);
                }}
              />
              <TextField
                id="outlined-basic"
                error={numFields.find(o => o.name === "tables")?.error !== ""}
                label="Πίνακες"
                name="tables"
                variant="outlined"
                helperText={numFields.find(o => o.name === "tables")?.error}
                value={numFields.find(o => o.name === "tables")?.value}
                onChange={(v) => {
                  handleNumFields(v);
                }}
              />
            </div>
            <div>
              <TextField
                id="outlined-basic"
                error={numFields.find(o => o.name === "diagrams")?.error !== ""}
                label="Διαγράμματα"
                name="diagrams"
                variant="outlined"
                helperText={numFields.find(o => o.name === "diagrams")?.error}
                value={numFields.find(o => o.name === "diagrams")?.value}
                onChange={(v) => {
                  handleNumFields(v);
                }}
              />
              <TextField
                id="outlined-basic"
                error={numFields.find(o => o.name === "maps")?.error !== ""}
                label="Χάρτες"
                name="maps"
                variant="outlined"
                helperText={numFields.find(o => o.name === "maps")?.error}
                value={numFields.find(o => o.name === "maps")?.value}
                onChange={(v) => {
                  handleNumFields(v);
                }}
              />
              <TextField
                id="outlined-basic"
                error={numFields.find(o => o.name === "drawings")?.error !== ""}
                label="Σχέδια"
                variant="outlined"
                name="drawings"
                helperText={numFields.find(o => o.name === "drawings")?.error}
                value={numFields.find(o => o.name === "drawings")?.value}
                onChange={(v) => {
                  handleNumFields(v);
                }}
              />
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
                value={confirmed}
                onChange={handleChangeConfirmed}
              >
                {confirmationStatus.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                disabled
                id="outlined-disabled"
                label="Ημερομηνία επικύρωσης"
                variant="outlined"
                value={confirmed_timestamp || "Δεν υπάρχει"}
              />
            </div>
          </Box>
          <Box sx={{ m: 2 }} />
          <FormControl fullWidth sx={{ m: 1 }}>
            <TextField
              id="outlined-multiline-static"
              label="Άδεια"
              multiline
              rows={2}
              value={license}
              onChange={(v) => {
                setLicense(v.target.value);
              }}
            />
          </FormControl>
          <FormControl fullWidth sx={{ m: 1 }}>
            <TextField
              id="outlined-multiline-static"
              label="Σχόλια"
              multiline
              rows={3}
              value={comments}
              onChange={(v) => {
                setComments(v.target.value);
              }}
            />
          </FormControl>
          <Box sx={{ m: 2 }} />
          <FormControl fullWidth sx={{ m: 1 }}>
            <TextField
              id="outlined-basic"
              label="Επιβλέπων"
              variant="outlined"
              value={supervisor}
              onChange={(v) => {
                setSupervisor(v.target.value);
              }}
            />
          </FormControl>
          
          {/* https://kiranvj.com/blog/blog/file-upload-in-material-ui/ */}
          {/* https://codesandbox.io/s/eager-euclid-mo7de?from-embed=&file=/src/index.js:241-271 */}

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
                disabled
                id="show-pdf"
                label="Αρχείο PDF απόθεσης"
                variant="outlined"
                value={file?.name || deposit.original_filename || ""}
              />


                <label htmlFor="upload-file">
                  <input
                  style={{ display: "none" }}
                  id="upload-file"
                  name="file"
                  type="file"
                  onChange={onFileUploadChange}
                  />
                  <Fab
                    color="secondary"
                    size="small"
                    component="span"
                    aria-label="add"
                    variant="extended"
                    sx={{ marginLeft:2, marginTop:2}}
                  >
                    Choose file
                  </Fab>
                </label>


                {/* <Button
                  disabled={!previewUrl}
                  onClick={onCancelFile}
                >
                  Cancel file
                </Button> */}

                
                <LoadingButton
                  color="secondary"
                  disabled={!previewUrl}
                  onClick={onUploadFile}
                  loading={loading}
                  loadingPosition="start"
                  startIcon={<AddCircleOutlineIcon />}
                  variant="contained"
                  sx={{ marginLeft:2, marginTop:2}}
                >
                  Upload PDF
                </LoadingButton>
              

            </div>
          </Box>


          <Box sx={{ '& > button': { m: 1 } }}>
            <LoadingButton
                color="secondary"
                disabled={numFieldsErrors > 0 || textFieldsErrors > 0}
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
            open={openFileError !== ""}
            autoHideDuration={6000}
            onClose={handleCloseFileError}
          >
            <Alert severity="error">
              <AlertTitle>Σφάλμα</AlertTitle>
               — <strong>{openFileError}</strong>
            </Alert>
          </Snackbar>

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

          <Snackbar
            open={openUploadSuccess}
            autoHideDuration={6000}
            onClose={handleCloseUploadSuccess}
          >
            <Alert severity="success">
              <AlertTitle>Επιτυχία</AlertTitle>
               — <strong>Το αρχείο αποθηκεύτηκε!</strong>
            </Alert>
          </Snackbar>
      
        </div>

      <pre>{viewData}</pre>
    </Layout>
  )
}

export default DepositPage
