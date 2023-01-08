// import React from "react";
import router, { useRouter } from 'next/router'
import Layout from "components/Layout";
import { withIronSessionSsr } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { User } from "pages/api/user";
import { InferGetServerSidePropsType } from "next";
import useUser from "lib/useUser";
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
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import { ChangeEvent, MouseEvent, useState } from "react";
import Fab from '@mui/material/Fab';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';


// Fetch deposit data
export const getServerSideProps = withIronSessionSsr(async function ({
  params,
  req,
  res,
}) {
  const user: User = req.session.user!;

  // https://www.learnbestcoding.com/post/25/nextjs-how-to-use-getserversideprops
  const depositId: number = Number(params?.id);

  if (user === undefined) {
    res.setHeader("location", "/login");
    res.statusCode = 302;
    res.end();
  }

  const prisma = new PrismaClient()

  if (isNaN(+depositId)) {

    const unconfirmedCount = !user.is_superuser?
      ((await prisma.deposit.aggregate({
        where: {
          submitter_id: user.id!,
          confirmed: false,
        },
        _count: {
          confirmed: true,
        },
      }))._count.confirmed || 0)
      : 0

    const addNewCount = !user.is_superuser?
      ((await prisma.permission.aggregate({
        where: {
          submitter_email: user.email!,
          due_to: {
            gte: new Date(),
            // gte: new Date('2022-12-26'),
          },
        },
        _count: {
          _all: true
        }
      }))._count._all || 0)
      : 0

    const canAddNewDeposit = !user?.is_superuser && unconfirmedCount < addNewCount;

    return {
      props: {
        user,
        deposit: null,
        submitterUser: null,
        canAddNewDeposit,
      },
    };
  }

  const deposit = user.is_superuser? 
    (await prisma.deposit.findFirst({
      where: {
        id: depositId,
      },
      include: {
        submitter: {
          select: {
            name_el: true,
            surname_el: true,
          }
        }
      }
    }))
    :
    (await prisma.deposit.findFirst({
      where: {
        id: depositId,
        submitter_id: user.id!,
      }
    }))

    const submitterUser = user.is_superuser?
      await prisma.user.findUnique(
        {
          where: {
            id: deposit?.submitter_id!,
          },
          select: {
            name_el: true,
            name_en: true,
            surname_el: true,
            surname_en: true,
            father_name_el: true,
            father_name_en: true,
          }
        }
      )
      :
      null;

  return {
    props : { user, deposit: JSON.parse(JSON.stringify(deposit)), submitterUser, canAddNewDeposit: false }
  }
}, sessionOptions);


function DepositPage(
  { user, deposit, submitterUser, canAddNewDeposit }: InferGetServerSidePropsType<typeof getServerSideProps>,
  ) {

  const depositReadOnly = !canAddNewDeposit && (user.id !== deposit?.submitter_id || deposit.confirmed)

  const canConfirm = user.isLibrarian

  // no entry in array
  const licenseChoices: string[] = []
  // first entry in array is empty string
  // const licenseChoices: string[] = ['']

  process.env.NEXT_PUBLIC_DEPOSIT_LICENSE_CHOICES?
    process.env.NEXT_PUBLIC_DEPOSIT_LICENSE_CHOICES.split(', ')
    .forEach(choice => {licenseChoices.push(choice)})
    :
    null;

  const languageChoices: string[] = []

  process.env.NEXT_PUBLIC_DEPOSIT_LANGUAGE_CHOICES?
    process.env.NEXT_PUBLIC_DEPOSIT_LANGUAGE_CHOICES.split(', ')
    .forEach(choice => {languageChoices.push(choice)})
    :
    null;

  const confirmationStatus = [
    {
      value: true,
      label: 'Ναι',
    },
    {
      value: false,
      label: 'Όχι',
    },
  ]

  const isKeywordsElValid = (str: string): boolean => {
    if (str.length === 0) {
      return true;
    }
    return (/^[, \u0370-\u03FF\u1F00-\u1FFF]*$/.test(str));
  }

  const isKeywordsEnValid = (str: string): boolean => {
    if (str.length === 0) {
      return true;
    }
    return (/^[, A-Za-z]*$/.test(str));
  }
  
  const [id, setId] = React.useState<number | null>(deposit?.id! || null)
  // const [title_el, setTitle_el] = React.useState(deposit.title_el || "");
  // const [title_en, setTitle_en] = React.useState(deposit.title_en || "");
  const [abstract_el, setAbstract_el] = React.useState(deposit?.abstract_el || "");
  const [abstract_en, setAbstract_en] = React.useState(deposit?.abstract_en || "");
  const [keywords_el, setKeywords_el] = React.useState(deposit?.keywords_el || "");
  const [keywords_en, setKeywords_en] = React.useState(deposit?.keywords_en || "");
  const [keywordsElValid ,setKeywordsElValid] = React.useState(isKeywordsElValid(deposit?.keywords_el || ""));
  const [keywordsEnValid ,setKeywordsEnValid] = React.useState(isKeywordsEnValid(deposit?.keywords_en || ""));
  const [confirmed, setConfirmed] = React.useState<boolean>(deposit?.confirmed || false);
  const [confirmedTimestamp, setConfirmedTimestamp] = React.useState(deposit?.confirmed_timestamp || "");
  const [license, setLicense] = React.useState(deposit?.license || (!id? process.env.NEXT_PUBLIC_DEPOSIT_LICENSE_DEFAULT : "") || "");
  const [language, setLanguage] = React.useState(deposit?.language || (!id? process.env.NEXT_PUBLIC_DEPOSIT_LANGUAGE_DEFAULT : "") || "");
  const [comments, setComments] = React.useState(deposit?.comments || "");
  const [supervisor, setSupervisor] = React.useState(deposit?.supervisor || "");
  
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
    {name: "title_el", value: deposit?.title_el || "", error: "" },
    {name: "title_en", value: deposit?.title_en || "", error: "" },
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
    {name: "pages", value: deposit?.pages || 0, error: "" },
    {name: "images", value: deposit?.images || 0, error: "" },
    {name: "tables", value: deposit?.tables || 0, error: "" },
    {name: "diagrams", value: deposit?.diagrams || 0, error: "" },
    {name: "maps", value: deposit?.maps || 0, error: "" },
    {name: "drawings", value: deposit?.drawings || 0, error: "" }
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

  const [confirmedStored, setConfirmedStored] = React.useState<boolean>(false);

  const handleChangeConfirmed = (event: React.ChangeEvent<HTMLInputElement>) => {
    const confirmation = event.target.value.toLowerCase() === 'true';
    setConfirmed(confirmation);
    const timestamp = confirmation? new Date() : ""
    setConfirmedTimestamp(timestamp);
  };

  const handleChangeLicense = (event: React.ChangeEvent<HTMLInputElement>) => {
    const licenseSelection = event.target.value;
    setLicense(licenseSelection);
  };

  const handleChangeLanguage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const languageSelection = event.target.value;
    setLicense(languageSelection);
  };

  const handleChangeKeywordsEl = (event: React.ChangeEvent<HTMLInputElement>) => {
    const str: string = event.target.value
      .replace(/,(?=[^\s])/g, ", ").replace(/  +/g, ' ').replace(/, ,+/g, ',');
    setKeywordsElValid(isKeywordsElValid(str));
    setKeywords_el(str);
  };

  const handleChangeKeywordsEn = (event: React.ChangeEvent<HTMLInputElement>) => {
    const str: string = event.target.value
      .replace(/,(?=[^\s])/g, ", ").replace(/  +/g, ' ').replace(/, ,+/g, ',').replace(/,\s*$/, "");
    setKeywordsEnValid(isKeywordsEnValid(str));
    setKeywords_en(str);
  };

  const [viewData, setViewData] = React.useState(JSON.stringify(deposit, null, 2));
  
  interface Body {
    [key: string]: any;
    title: string;
    title_el: string;
    title_en: string;
    abstract_el: string;
    abstract_en: string;
    pages: number;
    images: number;
    tables: number;
    diagrams: number;
    maps: number;
    drawings: number;
    confirmed: boolean;
    confirmed_timestamp: Date;
    license: string;
    comments: string;
    supervisor: string;
  }

  async function handleClickSave() {
    setLoading(true);
    // Remove spaces and commas at the end and beginning
    setKeywords_el(keywords_el.replace(/^[,\s]+|[,\s]+$/g, ''));
    setKeywords_en(keywords_en.replace(/^[,\s]+|[,\s]+$/g, ''));
    const body: Body = {
      //id: deposit?.id,
      // id: id,
      title: textFields.find(o => o.name === "title_el")?.value,
      title_el: textFields.find(o => o.name === "title_el")?.value,
      title_en: textFields.find(o => o.name === "title_en")?.value,
      abstract_el,
      abstract_en,
      // Remove spaces and commas at the end and beginning (async useState)
      keywords_el: keywords_el.replace(/^[,\s]+|[,\s]+$/g, ''),
      keywords_en: keywords_en.replace(/^[,\s]+|[,\s]+$/g, ''),
      pages: Number(numFields.find(o => o.name === "pages")?.value),
      language: (
        (language === '')?
          (process.env.NEXT_PUBLIC_DEPOSIT_LANGUAGE_DEFAULT?
            process.env.NEXT_PUBLIC_DEPOSIT_LAGUAGE_DEFAULT : "")
          : language),
      images: Number(numFields.find(o => o.name === "images")?.value),
      tables: Number(numFields.find(o => o.name === "tables")?.value),
      diagrams: Number(numFields.find(o => o.name === "diagrams")?.value),
      maps: Number(numFields.find(o => o.name === "maps")?.value),
      drawings: Number(numFields.find(o => o.name === "drawings")?.value),
      confirmed,
      confirmed_timestamp: confirmedTimestamp || null,
      license: (
        (license === '')?
          (process.env.NEXT_PUBLIC_DEPOSIT_LICENSE_DEFAULT?
            process.env.NEXT_PUBLIC_DEPOSIT_LICENSE_DEFAULT : "")
          : license),
      comments,
      supervisor,
    };
    id && (body.id = id);
    await fetch('/api/deposit' + (id? ('/' + id) : ""), {
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
      setConfirmedStored(data.confirmed);
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
    await fetch('/api/deposit/' + id, {
      method: 'DELETE',
      // headers: { 'Content-Type': 'application/json' },
      // body: JSON.stringify({id}),
    }) 
    .then(response => {
      setLoading(false);
      if(!response.ok) throw new Error(response.status as unknown as string);
      return response.json();
    })
    .then((data) => {
      setOpenSuccess(true);
      router.push('/deposits');
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
  const [storedFile, setStoredFile] = React.useState(deposit?.original_filename || null);

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
      formData.append("depositId", deposit?.id as unknown as string);
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
      setStoredFile(file.name);
      setFile(null);
      setPreviewUrl(null);
      // console.log("File was uploaded successfylly:", data);
    } catch (error) {
      setLoading(false);
      console.error(error);
      setOpenFileError("Κάτι δεν πήγε καλά!");
      // alert("Sorry! something went wrong.");
    }
  };

  const onDownloadFile = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    router.push('/api/download_file/' + deposit?.id);

  };
  
  const deleteButton = {
    backgroundColor: '#e62e00', '&:hover': { backgroundColor: '#cc0066' }
  };

  const profileNotCompleted = !submitterUser?.name_el || !submitterUser.name_en ||
    !submitterUser.surname_el || !submitterUser.surname_en ||
    !submitterUser.father_name_el || !submitterUser.father_name_en;

  return (
    <Layout>   
      <h1>Στοιχεία απόθεσης</h1>  
        <div>

          { user.is_superuser && !deposit.confirmed && profileNotCompleted && ( 
            <Alert severity="warning" sx={{ m: 1 }}>
              <AlertTitle>Προσοχή!</AlertTitle>
                Ο δημιουργός της απόθεσης δεν έχει συμπληρώσει <strong>όλα 
                τα πεδία</strong> που περιλαμβάνει το προφίλ.
            </Alert>
          )}

          { user.is_superuser && !deposit.confirmed && !deposit.original_filename && ( 
            <Alert severity="warning" sx={{ m: 1 }}>
              <AlertTitle>Προσοχή!</AlertTitle>
                Η απόθεση <strong>δεν περιλαμβάνει αποθηκευμένο 
                </strong> αρχείο.
            </Alert>
          )}

          { user?.is_superuser && (
            <>
              <FormControl fullWidth sx={{ m: 1 }}>
                <TextField
                  id="outlined-multiline-static"
                  disabled
                  label="Δημιουργός"
                  name="submitter_fullname"
                  value={deposit?.submitter.name_el + ' ' + deposit?.submitter.name_en}
                />
              </FormControl>

              <Box sx={{ m: 3 }} />
           </>
          )}

          <FormControl fullWidth sx={{ m: 1 }}>
            <TextField
              id="outlined-multiline-static"
              disabled={depositReadOnly}
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
              disabled={depositReadOnly}
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
              disabled={depositReadOnly}
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
              disabled={depositReadOnly}
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
          <FormControl fullWidth sx={{ m: 1 }}>
            <TextField
              id="outlined-multiline-static"
              disabled={depositReadOnly}
              error={!keywordsElValid}
              label="Λέξεις κλειδιά"
              helperText={!keywordsElValid && "Επιτρέπονται μόνο χαρακτήρες και το κόμμα"}
              multiline
              rows={3}
              value={keywords_el}
              onChange={handleChangeKeywordsEl}
            />
          </FormControl>
          <FormControl fullWidth sx={{ m: 1 }}>
            <TextField
              id="outlined-multiline-static"
              disabled={depositReadOnly}
              error={!keywordsEnValid}
              label="Λεξεις κλειδιά (Αγγλικά)"
              helperText={!keywordsEnValid && "Επιτρέπονται μόνο χαρακτήρες και το κόμμα"}
              multiline
              rows={3}
              value={keywords_en}
              onChange={handleChangeKeywordsEn}
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
                disabled={depositReadOnly}
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
                disabled={depositReadOnly}
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
                disabled={depositReadOnly}
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
                disabled={depositReadOnly}
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
                disabled={depositReadOnly}
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
                disabled={depositReadOnly}
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

          <FormControl fullWidth sx={{ m: 1 }}>
            <div>
              <TextField
                id="outlined-select-confirmation"
                disabled={depositReadOnly}
                select
                label="Γλώσσα"
                value={language}
                onChange={handleChangeLanguage}
                sx={{ width: '40%' }}
              >
                {languageChoices.map((option) => (
                  <MenuItem
                    key={String(option)}
                    value={String(option)}
                  >
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </div>
          </FormControl>

          <Box sx={{ m: 2 }} />
          <Box
            component="form"
            sx={{
              '& .MuiTextField-root': { m: 1, width: '40ch' },
            }}
            noValidate
            autoComplete="off"
          >
            <div>
              <TextField
                id="outlined-select-confirmation"
                disabled={(depositReadOnly && !canConfirm) || deposit?.confirmed || !user.is_superuser}
                select
                label="Επιβεβαιωμένη από Βιβλιοθηκονόμο"
                value={confirmed}
                onChange={handleChangeConfirmed}
                sx={{ width: '10ch' }}
              >
                {confirmationStatus.map((option) => (
                  <MenuItem key={String(option.value)} value={String(option.value)}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                disabled
                id="outlined-disabled"
                label="Ημερομηνία Επιβεβαίωσης"
                variant="outlined"
                value={confirmedTimestamp? new Date(confirmedTimestamp).toLocaleDateString('el') : null || "Δεν υπάρχει"}
                sx={{ width: '30ch' }}
              />
            </div>
          </Box>
          <Box sx={{ m: 2 }} />
          {/* <FormControl fullWidth sx={{ m: 1 }}>
            <TextField
              id="outlined-multiline-static"
              disabled={depositReadOnly}
              label="Άδεια"
              multiline
              rows={2}
              value={license}
              onChange={(v) => {
                setLicense(v.target.value);
              }}
            />
          </FormControl> */}

          <FormControl fullWidth sx={{ m: 1 }}>
          {/* <Box
            component="form"
            sx={{
              '& .MuiTextField-root': { m: 1, width: '40ch' },
            }}
            noValidate
            autoComplete="off"
          > */}
            <div>
              <TextField
                id="outlined-select-confirmation"
                disabled={depositReadOnly}
                select
                label="Άδεια"
                value={license}
                onChange={handleChangeLicense}
                sx={{ width: '100%' }}
              >
                {licenseChoices.map((option) => (
                  <MenuItem
                    key={String(option)}
                    value={String(option)}
                  >
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </div>
          {/* </Box> */}
          </FormControl>

          <FormControl fullWidth sx={{ m: 1 }}>
            <TextField
              id="outlined-multiline-static"
              disabled={(depositReadOnly && !canConfirm) || deposit?.confirmed || !user.is_superuser}
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
              disabled={depositReadOnly}
              label="Επιβλέπων"
              variant="outlined"
              value={supervisor}
              onChange={(v) => {
                setSupervisor(v.target.value);
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
            <LoadingButton
                color="secondary"
                disabled={!storedFile}
                onClick={onDownloadFile}
                loadingPosition="start"
                startIcon={<DownloadForOfflineIcon />}
                variant="contained"
                sx={{ marginLeft:1, marginTop:2}}
              >
                Κατεβασμα υπαρχοντος αρχειου {storedFile}
              </LoadingButton>
            </div>
          </Box>

          {/* https://kiranvj.com/blog/blog/file-upload-in-material-ui/ */}
          {/* https://codesandbox.io/s/eager-euclid-mo7de?from-embed=&file=/src/index.js:241-271 */}


          { !depositReadOnly && (
            <>

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
                // disabled
                inputProps={{readOnly: true}}
                id="show-pdf"
                label="Αρχείο PDF απόθεσης"
                variant="outlined"
                // Solved: `value` prop on `input` should not be null in React
                value={file?.name || storedFile || ""}
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


                <Fab
                  color="secondary"
                  size="small"
                  disabled={!previewUrl}
                  onClick={onCancelFile}
                  component="span"
                  aria-label="add"
                  variant="extended"
                  sx={{ marginLeft:2, marginTop:2}}
                >
                  Ακυρωση αρχειου
                </Fab>

                
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
                  Ανεβασμα PDF
                </LoadingButton>

              

            </div>
          </Box>




          </>
                )}        

          { ( !depositReadOnly || (!deposit?.confirmed && canConfirm && !confirmedStored)  ) && (
            <>

          <Box sx={{ m: 2 }} />

          <Box sx={{ '& > button': { m: 1 } }}>
            <LoadingButton
                color="secondary"
                disabled={!keywordsElValid || !keywordsEnValid || numFieldsErrors > 0 || textFieldsErrors > 0}
                onClick={handleClickSave}
                loading={loading}
                loadingPosition="start"
                startIcon={<SaveIcon />}
                variant="contained"
                >
                Αποθηκευση
              </LoadingButton>
              { !user.is_superuser && (
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
              )}
          </Box>

          </>
                )}

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

      {/* <pre>{viewData}</pre> */}
    </Layout>
  )
}

export default DepositPage
