import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from '@prisma/client'
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import * as yup from 'yup';

export default withIronSessionApiRoute(handler, sessionOptions);

const prisma = new PrismaClient()

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    // Handle any other HTTP methods
    res.status(400).json({ message: "Bad HTTP method." });
    return;
  }

  const user: any = req.session.user;

  if (!user?.isAdmin) {
    res.status(400).json({ message: "Access refused." });
    return;
  }

  // const validateEmail = (m: string) => {
  //   return String(m)
  //     .toLowerCase()
  //     .match(
  //       /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  //     );
  // }
  
  // Process a POST request
  const data = await req.body; // role

  const roleSchema = yup.object().shape({
    email: yup.string().email().required()
    .test(m => m?.split('@')[1] === 'hua.gr'),
    is_admin: yup.boolean().required(),
    is_secretary: yup.boolean().required(),
    is_librarian: yup.boolean().required(),
    is_active: yup.boolean().required(),
  }).noUnknown();
  
  if (!(roleSchema.isValidSync(data, { abortEarly: true, strict: true, }))) {
    res.status(400).json({ message: "Invalid input data." });
    return;
  }

  // const { id } = data;
  // const validEmail = validateEmail(data.email);
  // if (!data.email ||
  //     data.email === "" ||
  //     data.email.split('@')[1] !== 'hua.gr' ||
  //     validEmail === null ||
  //     typeof data.is_admin !== 'boolean' ||
  //     typeof data.is_secretary !== 'boolean' ||
  //     typeof data.is_librarian !== 'boolean' ||
  //     typeof data.is_active !== 'boolean') {
  //   res.status(400).json({ message: "Invalid data." });
  //   return;
  // }

  try {
    const role = await prisma.role.create({
      data
    })
    res.json(role);
    return;
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
    return;
  }
  
}