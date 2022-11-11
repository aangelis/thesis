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
  const [title_el, setTitle_el] = React.useState(deposit.title_el || "");
  const [title_en, setTitle_en] = React.useState(deposit.title_en || "");
  const [abstract_el, setAbstract_el] = React.useState(deposit.abstract_el || "");
  const [abstract_en, setAbstract_en] = React.useState(deposit.abstract_en || "");
  const [confirmed, setConfirmed] = React.useState(deposit.confirmed);
  const [confirmed_timestamp, setConfirmed_timestamp] = React.useState(deposit.confirmed_timestamp);
  const [license, setLicense] = React.useState(deposit.license || "");
  const [comments, setComments] = React.useState(deposit.comments || "");
  const [supervisor, setSupervisor] = React.useState(deposit.comments || "");
  
  const [loading, setLoading] = React.useState(false);
  const [saveDisabled, setSaveDisabled] = React.useState(0)
  
  const [openSuccess, setOpenSuccess] = React.useState(false)
  const [openError, setOpenError] = React.useState(false)
  
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

  const numericalFields =[
    {name: "pages", value: deposit.pages, error: "" },
    {name: "images", value: deposit.images, error: "" },
    {name: "tables", value: deposit.tables, error: "" },
    {name: "diagrams", value: deposit.diagrams, error: "" },
    {name: "maps", value: deposit.maps, error: "" },
    {name: "drawings", value: deposit.drawings, error: "" }
  ]
  const [numFields, setNumFields] = React.useState(numericalFields);
  const handleNumFields = (e: any) => {
    const result = numFields.map((el) => {
      if (el.name === e.target.name) {
        el.value = e.target.value;
        if (Number(el.value) >= 0
            && el.value !== "" && el.error !== "") {
          el.error = "";
          setSaveDisabled(saveDisabled - 1);
        }
        if ((Number(el.value) < 0 || isNaN(+el.value) || el.value === "")
            && el.error === "") {
          el.error = "Positive number needed!";
          setSaveDisabled(saveDisabled + 1);
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
  const handleCloseError = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenError(false);
  };

  const handleChangeConfirmed = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmed(event.target.value);
  };
  
  const [viewData, setViewData] = React.useState(JSON.stringify(deposit, null, 2));

  async function handleClickSave() {
    setLoading(true);
    const body = {
      id: deposit.id,
      title_el,
      title_en,
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
              value={title_el}
              onChange={(v) => {
                setTitle_el(v.target.value);
              }}
            />
          </FormControl>
          <FormControl fullWidth sx={{ m: 1 }}>
            <TextField
              id="outlined-multiline-static"
              label="Τίτλος (Αγγλικά)"
              multiline
              rows={2}
              value={title_en}
              onChange={(v) => {
                setTitle_en(v.target.value);
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
          
          <Box sx={{ '& > button': { m: 1 } }}>
            <LoadingButton
                color="secondary"
                disabled={saveDisabled > 0}
                onClick={handleClickSave}
                loading={loading}
                loadingPosition="start"
                startIcon={<SaveIcon />}
                variant="contained"
              >
                Save
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

      <pre>{viewData}</pre>
    </Layout>
  )
}

export default DepositPage
