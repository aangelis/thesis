import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from '@prisma/client'
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import * as yup from 'yup';

export default withIronSessionApiRoute(handler, sessionOptions);

const prisma = new PrismaClient()

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    // Handle any other HTTP methods
    res.status(400).json({ message: "Bad HTTP method." });
    return;
  }

  const user: any = req.session.user;

  if (!user?.isAdmin) {
    res.status(400).json({ message: "Access refused." });
    return;
  }
  
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

  try {
    const role = await prisma.role.create({
      data
    })

    const roles = await prisma.role.findMany()

    const emails: string[] = [];
    roles.forEach(({email: v}) => emails.push(v))

    const index: number = emails.indexOf(role.email, 0);
    if (index > -1) {
      emails.splice(index, 1);
    }

    res.json({...role, stored_emails: emails});
    return;
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
    return;
  }
  
}