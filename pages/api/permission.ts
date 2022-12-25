import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from '@prisma/client'
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";

export default withIronSessionApiRoute(handler, sessionOptions);

const prisma = new PrismaClient()

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    // Handle any other HTTP methods
    res.status(400).json({ message: "Bad HTTP method." });
    return;
  }

  const user: any = req.session.user;

  if (!user?.isSecretary) {
    res.status(400).json({ message: "Access refused." });
    return;
  }

  const validateEmail = (m: string) => {
    return String(m)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  }
  
  // Process a POST request
  const data = await req.body; // permission
  const { id } = data;

  if (data.id && user.id !== data.sectretary_id) {
    res.status(400).json({ message: "Access refused." });
    return;
  }

  const validEmail = validateEmail(data.submitter_email);
  console.log(data);
  // console.log(typeof data.is_secretary);
  console.log((data.due_to instanceof Date))
  if (!data.submitter_email ||
      data.submitter_email === "" ||
      data.submitter_email.split('@')[1] !== 'hua.gr' ||
      validEmail === null 
      // ||
      // !(data.due_to instanceof Date)
      ) {
    res.status(400).json({ message: "Invalid data." });
    return;
  }

  try {
    const existingPermission = data.id? await prisma.permission.findUnique({
      where: { 
        id: data.id
      }
    }) : false
    if (existingPermission) {
      const permission = await prisma.permission.update({
        where: {
          id: existingPermission.id,
        },
        data
      })
      res.json(permission);
    } else {
      const permission = await prisma.permission.create({
        data: {
          submitter_email: data.submitter_email,
          due_to: data.due_to,
          secretary_id: user.id,
        }
      })
      res.json(permission);
    }
    return;
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
    return;
  }
  
}