# thesis.hua.gr - Πύλη Φοιτητών

H παρούσα εφαρμογή υποστηρίζει την αυτοαπόθεση των πτυχιακών, μεταπτυχιακών εργασιών και διδακτορικών διατριβών που εκπονούνται στο Χαροκόπειο Πανεπιστήμιο. 

Βασίζεται στο [Next.js](https://nextjs.org/) και έγινε bootstrapped με [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Πώς τρέχω το project

Με τις εντολές:

```bash
npm install
npm run dev
```

Στη διεύθυνση [http://localhost:3000](http://localhost:3000) βλέπουμε το αποτέλεσμα.

#### Οδηγίες εγκατάστασης k8s

[k8s/README.md](k8s/README.md)

## Βάση χρηστών κατά τη διάρκεια της ανάπτυξης

Στη διεύθυνση [http://localhost:3000/api/dummyldap](http://localhost:3000/api/dummyldap) στέλνουμε σε μορφή JSON το username (χωρίς το domain) και το password του χρήστη και μας επιστρέφει σε μορφή JSON τα στοιχεία email, username, first_name, last_name, full_name, title και department. Στην περίπτωση σφάλματος επιστρέφει αντίστοιχο μήνυμα.
Το endpoint επιστρέφει στατικά καταχωρημένα αντικείμενα χρηστών με τους κατάλληλους ρόλους για τις ανάγκες της ανάπτυξης της εφαρμογής.


## Διασύνδεση με τον LDAP server του ιδρύματος

Στη διεύθυνση [http://localhost:3000/api/ldap](http://localhost:3000/api/ldap) στέλνουμε σε μορφή JSON το username (χωρίς το domain) και το password του χρήστη και μας επιστρέφει σε μορφή JSON τα στοιχεία email, username, first_name, last_name, full_name, title και department. Στην περίπτωση σφάλματος επιστρέφει αντίστοιχο μήνυμα. Η λειτουργία του endpoint προϋποθέτει την πετυχημένη διασύνδεση με τον LDAP server τους ιδρύματος (χρήση VPN ή τοπική λειτουργία στις υποδομές του ιδρύματος).


