import type { NextPage } from 'next'
import Link from 'next/link'
import Layout from "components/Layout";
import useUser from "lib/useUser";
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

export default function Home() {
  // here we just check if user is already logged in and redirect to profile
  const { mutateUser } = useUser({
    redirectTo: "/deposits",
    redirectIfFound: true,
  });
  return (
        
      <Layout>
      <a href="https://www.hua.gr">Χαροκόπειο Πανεπιστήμιο</a>
      <h4>Βιβλιοθήκη και Κέντρο Πληροφόρησης</h4>
      <h4>Υπηρεσία Αυτοαπόθεσης Εργασιών</h4>

      <h1>Πύλη Φοιτητών</h1>
      <div>
      H παρούσα εφαρμογή υποστηρίζει την αυτοαπόθεση των πτυχιακών, μεταπτυχιακών εργασιών
      και διδακτορικών διατριβών που εκπονούνται στο Χαροκόπειο Πανεπιστήμιο. 
      </div>

      <ul>
        <li><Link href="/login">
          <a>Σύνδεση</a>
        </Link></li>
        <li><Link href="/user/deposits">
          <a>Οι αποθέσεις μου</a>
        </Link></li>
      </ul>
      </Layout>
  )
}


