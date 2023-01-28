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
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Snackbar from '@mui/material/Snackbar';
import { Dayjs } from 'dayjs';
import 'dayjs/locale/el';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { validateEmail } from 'lib/utils';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

// Fetch deposit data
export const getServerSideProps = withIronSessionSsr(async function ({
  params,
  req,
  res,
}) {
  const user: User = req.session.user!;

  const permissionId = Number(params?.id);

  if (user === undefined) {
    res.setHeader("location", "/login");
    res.statusCode = 302;
    res.end();
    // return {
    //   props: {
    //     user: { id: null, email: null, username: null, isLoggedIn: false } as User,
    //     permission: {}
    //   },
    // };
  }

  if (!user?.isSecretary) {
    res.setHeader("location", "/profile");
    res.statusCode = 302;
    res.end();
    // return {
    //   props: {
    //     user,
    //     permission: {}
    //   },
    // };
  }

  if (isNaN(+permissionId)) {
    return {
      props: {
        user,
        permission: {}
      },
    };
  }

  const prisma = new PrismaClient()
  const permission: any = await prisma.permission.findFirst({
    where: {
     id: permissionId,
    },
    include: {
      secretary: {
        select: {
          first_name: true,
          last_name: true,
        }
      }
    }
  })


  return {
    props : { user, permission: JSON.parse(JSON.stringify(permission)) }
  }
}, sessionOptions);


function PermissionPage(
  { user, permission }: InferGetServerSidePropsType<typeof getServerSideProps>,
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

  const [id, setId] = React.useState<number | null>(permission?.id! || null)
  const [email, setEmail] = React.useState(permission.submitter_email || "");
  const [emailError, setEmailError] = React.useState("");
  const [dueTo, setDueTo] = React.useState<Dayjs | null>(permission?.due_to || null);
  // const [dueTo, setDueTo] = React.useState<Date>(new Date(permission?.due_to) || null);
  const [dateError, setDateError] = React.useState("");
  const [secretary, setSecretary] = React.useState(
    permission?.secretary?.first_name + " " + permission?.secretary?.last_name
    );

  const [loading, setLoading] = React.useState(false);
  
  const [openSuccess, setOpenSuccess] = React.useState(false);
  const [openError, setOpenError] = React.useState(false);
  
  const [viewData, setViewData] = React.useState(JSON.stringify(permission, null, 2));


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
    submitter_email: string,
    // secretary_id: string;
    due_to: Date;
  }

  async function handleClickSave() {
    setLoading(true);
    const body: Body = {
      // id,
      submitter_email: email,
      // secretary_id: permission.secretary_id,
      // due_to: dueTo?.$d,
      due_to: dueTo?.toDate()!,
    };
    // add id key only when id is not null or undefined
    id && (body.id = id);
    await fetch('/api/permission' + (id? ('/' + id) : ""), {
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
    handleCloseDialogDelete();
    setLoading(true);
    await fetch('/api/permission/' + id, {
      method: 'DELETE',
    }) 
    .then(response => {
      setLoading(false);
      if(!response.ok) throw new Error(response.status as unknown as string);
      return response.json();
    })
    .then((data) => {
      setOpenSuccess(true);
      router.push('/depositpermissions');
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

  const onDateChange = (e: any) => {
      const dateValue = e.target.value || "";
      if (dateValue === "") {
        setDateError("No date provided.");
        return;
      }
      setDateError("");
      return;
    };

  React.useEffect(() => {
    onDateChange(
      {target:
        {name: "dueTo", value: dueTo}
      });
  }, [dueTo]);

  const permissionReadOnly = permission.id && permission.secretary_id !== user?.id || new Date(permission.due_to) < new Date()

  const deleteButton = {
    backgroundColor: '#e62e00', '&:hover': { backgroundColor: '#cc0066' }
  };

  const [openDialogDelete, setOpenDialogDelete] = React.useState(false);

  const handleClickOpenDialogDelete = () => {
    setOpenDialogDelete(true);
  };

  const handleCloseDialogDelete = () => {
    setOpenDialogDelete(false);
  };

  return (
    <Layout>   
      <h1>Στοιχεία δικαιώματος αυτοαπόθεσης</h1>
        <div>
          <FormControl fullWidth sx={{ m: 1 }}>
            <TextField
              id="outlined-multiline-static"
              disabled={permissionReadOnly}
              error={emailError !== ""}
              label="Ηλεκτρονική διεύθυνση ταχυδρομείου"
              helperText={emailError}
              value={email}
              onChange={
                (v) => { setEmail(v.target.value); }
              }
              sx={{ width: 400 }}
            />
          </FormControl>

          <Box sx={{ m: 2 }} />

          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="el">
            <DatePicker
              disablePast={!permissionReadOnly}
              disabled={permissionReadOnly}
              label="Καταληκτική ημερομηνία"
              value={dueTo}
              onChange={(newValue) => {
                const dj: Dayjs = newValue!;
                setDueTo(dj.endOf('day'))
              }}
              renderInput={(params) =>
              <TextField
                error={dateError !== ""}
                helperText={dateError}
                sx={{ m: 1 }}
                {...params} />
              }
            />
          </LocalizationProvider>

          { permission.id? (
            <>
            <Box sx={{ m: 2 }} />
  
            <TextField
              disabled
              id="outlined-basic"
              label="Υπεύθυνος/η Γραμματείας"
              value={secretary}
              // onChange={handleChangeConfirmed}
              // onChange={
              //   (v) => { setSecretaryId(v.target.value) }
              // }
              sx={{ m: 1, width: 350 }}
            />
            </>
          ):
          (<></>)
          }

          { !permissionReadOnly && (

            <>
              <Box sx={{ m: 2 }} />
              
              <Box sx={{ '& > button': { m: 1 } }}>
                <LoadingButton
                    color="secondary"
                    disabled={(emailError !== "") || (dateError !== "")}
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
                    // onClick={handleClickDelete}
                    onClick={handleClickOpenDialogDelete}
                    loading={loading}
                    loadingPosition="start"
                    startIcon={<DeleteIcon />}
                    variant="contained"
                    sx={deleteButton}
                    >
                    Διαγραφή
                  </LoadingButton>
                  <Dialog
                    open={openDialogDelete}
                    onClose={handleCloseDialogDelete}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                  >
                    <DialogTitle id="alert-dialog-title">
                      {"Είστε σίγουροι ότι θέλετε να διαγράψετε την εγγραφή;"}
                    </DialogTitle>
                    <DialogContent>
                      <DialogContentText id="alert-dialog-description">
                        Τα δεδομένα της διαγραμμένης εγγραφής δεν μπορούν να ανακτηθούν.
                      </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={handleCloseDialogDelete}>Όχι</Button>
                      <Button onClick={handleClickDelete} autoFocus>
                        Ναι
                      </Button>
                    </DialogActions>
                  </Dialog>
              </Box>
            </>

          )}

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

export default PermissionPage
