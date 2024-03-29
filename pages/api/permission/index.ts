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

  if (!user?.isLoggedIn) {
    res.status(400).json({ message: "Access refused. User not logged in." });
    return;
  }

  if (!user?.isSecretary) {
    res.status(400).json({ message: "Access refused." });
    return;
  }
  
  // Process a POST request
  const data = await req.body; // permission

  const permissionSchema = yup.object().shape({
    submitter_email: yup.string().email().required()
      .test(m => m?.split('@')[1] === 'hua.gr'),
    // https://github.com/jquense/yup/issues/1218
    due_to: yup.string().required()
    .test(dateString => 
      ((new Date(dateString!).toString() !== 'Invalid Date')
      && (new Date(dateString!) >= new Date()))
    ),
  }).noUnknown();
  
  if (!(permissionSchema.isValidSync(data, { abortEarly: true, strict: true, }))) {
    res.status(400).json({ message: "Invalid input data." });
    return;
  }

  try {
    const permission = await prisma.permission.create({
      data: {
        submitter_email: data.submitter_email,
        due_to: data.due_to,
        secretary_id: user.id,
      }
    })
    res.json(permission);
    return;
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
    return;
  }
  
}