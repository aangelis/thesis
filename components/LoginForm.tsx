import * as React from 'react';
import { FormEvent } from "react";

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, styled, ThemeProvider } from '@mui/material/styles';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';

export default function Form({
  errorMessage,
  onSubmit,
}: {
  errorMessage: string;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) {

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log({
      email: data.get('email'),
      password: data.get('password'),
    });
    onSubmit(event);
  };

  const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: '#f5f5f9',
      color: 'rgba(0, 0, 0, 0.87)',
      maxWidth: 220,
      fontSize: theme.typography.pxToRem(12),
      border: '1px solid #dadde9',
    },
  }));

  
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  
  const [disableSubmit, setDisableSubmit] = React.useState(true);

  const validateEmail = (m: string) => {
    return String(m)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  React.useEffect(() => {
    if (email === "") { setDisableSubmit(true); return; }
    // if (password === "") { setDisableSubmit(true); return; }
    // small valid minimum length for development purposes
    if (password.length < 4) { setDisableSubmit(true); return; }
    const validEmail = validateEmail(email);
    if (email.split('@')[1] !== 'hua.gr') { setDisableSubmit(true); return; }
    if (validEmail === null) { setDisableSubmit(true); return; }

    setDisableSubmit(false);
}, [email, password]);

  return (

<>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Σύνδεση
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(v) => {
                setEmail(v.target.value);
              }}
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              value={password}
              onChange={(v) => {
                setPassword(v.target.value);
              }}
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
              {errorMessage && <Box sx={{color: 'red'}}>{errorMessage}</Box>}
            <Button
              type="submit"
              fullWidth
              disabled={disableSubmit}
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Συνδεση
            </Button>
            <Grid container>
              <Grid item xs>
              
              <HtmlTooltip
                      title={
                        <React.Fragment>
                          {/* https://mui.com/material-ui/react-tooltip/ */}
                          
                          <Typography color="inherit">
                            Στοιχεία σύνδεσης
                          </Typography>
                          Για να συνδεθείτε στην υπηρεσία μπορείτε να χρησιμοποιήσετε
                          τα στοιχεία πρόσβασης του <u>ιδρυματικού σας λογαριασμού</u>. 
                          
                        </React.Fragment>
                      }
                    ><div>Πώς βρίσκω τα στοιχεία της σύνδεσης;</div></HtmlTooltip>
                
                  
                
              </Grid>
            </Grid>
          </Box>
        </Box>

      </Container>



  
    </>
  
  );
}