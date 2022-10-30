This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Πώς τρέχω το project

Με τις εντολές:

```bash
npm install
npm run dev
```

Στη διεύθυνση [http://localhost:3000](http://localhost:3000) βλέπουμε το αποτέλεσμα.

## Βάση χρηστών κατά τη διάρκεια της ανάπτυξης

Στη διεύθυνση [http://localhost:3000/api/dummyldap](http://localhost:3000/api/dummyldap) στέλνουμε σε μορφή JSON το username (χωρίς το domain) και το password του χρήστη και μας επιστρέφει σε μορφή JSON τα στοιχεία email, username, first_name, last_name, full_name, title και department. Στην περίπτωση σφάλματος επιστρέφει αντίστοιχο μήνυμα.
Το endpoint επιστρέφει στατικά καταχωρημένα αντικείμενα χρηστών με τους κατάλληλους ρόλους για τις ανάγκες της ανάπτυξης της εφαρμογής.


## Διασύνδεση με τον LDAP server του ιδρύματος

Στη διεύθυνση [http://localhost:3000/api/ldap](http://localhost:3000/api/ldap) στέλνουμε σε μορφή JSON το username (χωρίς το domain) και το password του χρήστη και μας επιστρέφει σε μορφή JSON τα στοιχεία email, username, first_name, last_name, full_name, title και department. Στην περίπτωση σφάλματος επιστρέφει αντίστοιχο μήνυμα. Η λειτουργία του endpoint προϋποθέτει την πετυχημένη διασύνδεση με τον LDAP server τους ιδρύματος (χρήση VPN ή τοπική λειτουργία στις υποδομές του ιδρύματος).


