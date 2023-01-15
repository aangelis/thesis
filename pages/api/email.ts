import { NextApiRequest, NextApiResponse } from "next";
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { User } from "pages/api/user";
import * as yup from 'yup';
import { SMTPClient } from 'emailjs';
// import * as LH from 'is-localhost-ip';
import isLocalHost from 'is-localhost-ip';

export default withIronSessionApiRoute(handler, sessionOptions);

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ip = req.socket.remoteAddress;
  const method = req.method;
  if (method !== "POST") {
    // Handle any other HTTP methods
    console.log(`${ip} - [${new Date()}] - email endpoint - Bad HTTP method.`)
    res.status(400).json({ message: "Bad HTTP method." });
    return;
  }

  if (!isLocalHost(ip!)) {
    console.log(`${ip} - [${new Date()}] - email endpoint - Access denied.`)
    res.status(400).json({ message: "Access refused. User not logged in." });
    return;
  }

  interface Data {
    fullname: string
    email: string;
    subject: string;
    text: string;
    [key: string]: any;
  };

  // Process request
  const body = await req.body; // email data
  const data = JSON.parse(body);
  const dataEntries = Object.entries(data)

  // check count of input data keys
  if (dataEntries.length !== 4) {
    console.log(`${ip} - [${new Date()}] - email endpoint - Invalid input data.`)
    res.status(400).json({ message: "Invalid input data." });
    return;
  }
  // manual transform of fields values, transfrom in yup strict mode does not work
  dataEntries.forEach(([k,v], i) => {
    if(typeof v !== 'string') {
      console.log(`${ip} - [${new Date()}] - email endpoint - Invalid input data.`)
      res.status(400).json({ message: "Invalid input data." });
      return;
    }
    // Remove spaces and commas at the end and beginning of all key values
    (data as Record<typeof k, string|number>)[k] = data[k].replace(/^[,\s]+|[,\s]+$/g, '')
  })

  const emailSchema = yup.object().shape({
    fullname: yup.string().test(val => val!.toString().length > 0),
    email: yup.string().email().required()
    .test(m => m?.split('@')[1] === 'hua.gr'),
    subject: yup.string().test(val => val!.toString().length > 0),
    text: yup.string().test(val => val!.toString().length > 0),
  }).noUnknown();
  
  if (!(emailSchema.isValidSync(data, { abortEarly: true, strict: true, }))) {
    console.log(`${ip} - [${new Date()}] - email endpoint - Invalid input data.`)
    res.status(400).json({ message: "Invalid input data." });
    return;
  }

  const client = new SMTPClient({
    user: process.env.SMTP_USERNAME,
    password: process.env.SMTP_PASSWORD,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT as unknown as number || 25,
    ssl: process.env.SMTP_SSL === "true",
  });

  const messageFooter = process.env.MESSAGE_FOOTER! || "";

  client.send(
    {
      from: `Σύστημα αυτοαπόθεσης <${process.env.SMTP_FROM_EMAIL!}>`,
      to: `${data.fullname} <${data.email!}>`,
      subject: data.subject!,
      text: data.text! + messageFooter,
    },
    (err, message) => {
      if (err) {
        console.log(`${ip} - [${new Date()}] - email endpoint - Send email error.`);
      } else {
        console.log(`${ip} - [${new Date()}] - mail endpoint - subject: '${data.subject}'`);
        res.status(400).json({ message: "Mail sent." });
      }
      
    }
  )

  return;

}