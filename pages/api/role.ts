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

  if (!user?.isAdmin) {
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
  const data = await req.body; // role
  const { id } = data;
  const validEmail = validateEmail(data.email);
  // console.log(data);
  // console.log(typeof data.is_secretary);
  
  if (!data.email ||
      data.email === "" ||
      data.email.split('@')[1] !== 'hua.gr' ||
      validEmail === null ||
      typeof data.is_admin !== 'boolean' ||
      typeof data.is_secretary !== 'boolean' ||
      typeof data.is_librarian !== 'boolean' ||
      typeof data.is_active !== 'boolean') {
    res.status(400).json({ message: "Invalid data." });
    return;
  }

  try {
    const existingRole = await prisma.role.findUnique({
      where: { 
        email: data.email
      }
    })
    if (existingRole) {
      const role = await prisma.role.update({
        where: {
          id: existingRole.id,
        },
        data
      })
      res.json(role);
    } else {
      const role = await prisma.role.create({
        data
      })
      res.json(role);
    }
    return;
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
    return;
  }
  
}