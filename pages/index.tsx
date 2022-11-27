import Link from '@mui/material/Link';
import Layout from "components/Layout";
import useUser from "lib/useUser";
import Image from 'next/image'
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import LoginIcon from '@mui/icons-material/Login';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

export default function Home() {
  // here we just check if user is already logged in and redirect to profile
  const { mutateUser } = useUser({
    redirectTo: "/profile",
    redirectIfFound: true,
  });

  return (
        
      <Layout>
        <List dense>
          <ListItem>
            <Link href="https://www.hua.gr" underline="none">
              <Image src="/Hua-Logo.webp" alt="Χαροκόπειο Πανεπιστήμιο" width="90" height="85" />
            </Link>
          </ListItem>
          <ListItem>
            <Link href="https://www.hua.gr" underline="none">Χαροκόπειο Πανεπιστήμιο</Link>
          </ListItem>
          <ListItem>
            <Link href="http://www.library.hua.gr/" underline="none">Βιβλιοθήκη και Κέντρο Πληροφόρησης</Link> 
          </ListItem>
          <ListItem>
            <Link href="/" underline="none">Υπηρεσία Αυτοαπόθεσης Εργασιών</Link>
          </ListItem>
        </List>
        <h1>Πύλη Φοιτητών</h1>
        <div>
        H παρούσα εφαρμογή υποστηρίζει την αυτοαπόθεση των πτυχιακών, μεταπτυχιακών εργασιών
        και διδακτορικών διατριβών που εκπονούνται στο Χαροκόπειο Πανεπιστήμιο. 
        </div>

        <Box sx={{ m: 2 }} />

        <Link href="/login">
          <Button
            variant="contained"
            endIcon={<LoginIcon />}
          >
          Εισοδος
          </Button>
        </Link>

      </Layout>
  )
}


