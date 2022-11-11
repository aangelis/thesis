import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email, password } = await req.body;
  const ip = req.socket.remoteAddress
  const now = new Date()
  
  if (req.method === "POST") {
    // Process a POST request

    if (email === "itp21101@hua.gr" && password === "1234") {
      console.log(`${ip} - [${now}] - success - ${email}`);
      res.json({
        email: "itp21101@hua.gr",
        username: "itp21101",
        first_name: "ΑΠΟΣΤΟΛΟΣ",
        last_name: "ΑΓΓΕΛΗΣ",
        // full_name: "ΑΠΟΣΤΟΛΟΣ ΑΓΓΕΛΗΣ",
        title: "Μεταπτυχιακός Φοιτητής",
        department: "Πληροφορικής και Τηλεματικής",
      })
    } else if (email === "itp21100@hua.gr" && password === "1234") {
      console.log(`${ip} - [${now}] - success - ${email}`);
      res.json({
        email: "itp21100@hua.gr",
        username: "itp21100",
        first_name: "ΒΑΣΙΛΗΣ",
        last_name: "ΗΛΙΟΥ",
        title: "Μεταπτυχιακός Φοιτητής",
        department: "Πληροφορικής και Τηλεματικής",
      })
    } else if (email === "tsadimas@hua.gr" && password === "1234") {
      console.log(`${ip} - [${now}] - success - ${email}`);
      res.json({
        email: "tsadimas@hua.gr",
        username: "tsadimas",
        first_name: "ΑΝΑΡΓΥΡΟΣ",
        last_name: "ΤΣΑΔΗΜΑΣ",
        title: "Διδακτικό Προσωπικό",
        department: "Πληροφορικής και Τηλεματικής",
        is_superuser: true,
      })
    } else if (email === "ifigenia@hua.gr" && password === "1234") {
      console.log(`${ip} - [${now}] - success - ${email}`);
      res.json({          
        // id: 2,
        email: "ifigenia@hua.gr",
        username: "ifigenia",
        first_name: "ΙΦΙΓΕΝΕΙΑ",
        last_name: "ΒΑΡΔΑΚΩΣΤΑ",
        title: "Bιβλιοθηκάριος",
        department: "Βιβλιοθήκη και Κέντρο Πληροφόρησηςς",
        // name_el: null,
        // name_en: null,
        // surname_el: null,
        // surname_en: null,
        // father_name_el: null,
        // father_name_en: null,
        // department: null,
        // title: null,
        // title_ldap: null,
        // is_staff: false,
        // is_active: true,
        // is_superuser: false,
        // last_login: null,
        // date_joined is auto polulated due to prisma conf 
        // date_joined: "2022-10-17T18:34:10.969Z"
      }); 
    } else if ( !email || !password ) {
      console.error(`${ip} - [${now}] - failure - - No email and/or password provided`);
      res.status(400).json({ message: "No email and/or password provided." });
    } else {
      console.error(`${ip} - [${now}] - failure - ${email} - Wrong credentials provided`);
      res.status(401).json({ message: "Wrong credentials provided." });
    }

  } else {
    // Handle any other HTTP methods
    console.error(`${ip} - [${now}] - failure - - Bad HTTP method`);
    res.status(400).json({ message: "Bad HTTP method." });
  }
  
}

