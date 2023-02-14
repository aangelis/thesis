import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from '@prisma/client'
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { User } from "pages/api/user";
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
  const user: User = req.session.user!;

  if (!user?.isLoggedIn) {
    res.status(400).json({ message: "Access refused. User not logged in." });
    return;
  }

  if (user.is_superuser) {
    res.status(400).json({ message: "Adding new deposit is not allowed." });
    return;
  }

  // Process a POST request data
  const data = await req.body; // deposit

  const {
    id,
    confirmed,
    confirmed_timestamp,
    comments,
    submitter_id,
    submitter_department,
    submitter_title,
    ...rest
  } = data;
  
  const isKeywordsElValid = (str: string | null | undefined): boolean => {
    if (!str) {
      return true;
    }
    if (str.length === 0) {
      return true;
    }
    return (/^[, -.()\u0370-\u03FF\u1F00-\u1FFF]*$/.test(str));
  }

  const isKeywordsEnValid = (str: string | null | undefined): boolean => {
    if (!str) {
      return true;
    }
    if (str.length === 0) {
      return true;
    }
    return (/^[, -.()A-Za-z]*$/.test(str));
  }

  const depositSchema = yup.object().shape({
    title_el: yup.string().test(val => val!.toString().length > 0 && val!.toString().length <= 500),
    title_en: yup.string().test(val => val!.toString().length > 0 && val!.toString().length <= 500),
    abstract_el: yup.string().test(val => val!.toString().length >= 0 && val!.toString().length <= 65535),
    abstract_en: yup.string().test(val => val!.toString().length >= 0 && val!.toString().length <= 65535),
    keywords_el: yup.string().test(val => {
      return (val!.toString().length == 0 || (val!.toString().length > 0 && val!.toString().length <= 65535 && isKeywordsElValid(val)))
    }),
    keywords_en: yup.string().test(val => {
      return (val!.toString().length == 0 || (val!.toString().length > 0 && val!.toString().length <= 65535 && isKeywordsEnValid(val)))
    }),
    pages: yup.number().integer().required().min(0),
    language: yup.string().test(val => val!.toString().length > 0 && val!.toString().length <= 50),
    images: yup.number().integer().required().min(0),
    tables: yup.number().integer().required().min(0),
    diagrams: yup.number().integer().required().min(0),
    maps: yup.number().integer().required().min(0),
    drawings: yup.number().integer().required().min(0),
    confirmed: yup.boolean().required(),
    license: yup.string().test(val => val!.toString().length > 0 && val!.toString().length <= 100),
    comments: yup.string().test(val => val!.toString().length >= 0),
    supervisor: yup.string().test(val => val!.toString().length >= 0 && val!.toString().length <= 100),
  }).noUnknown();

  if (!(depositSchema.isValidSync(data, { abortEarly: true, strict: true, }))) {
    res.status(400).json({ message: "Invalid input data." });
    return;
  }
  
  // Check is user can add a new deposit
  const unconfirmedCount = 
    (await prisma.deposit.aggregate({
      where: {
        submitter_id: user.id!,
        confirmed: false,
      },
      _count: {
        confirmed: true,
      },
    }))._count.confirmed || 0

  const addNewCount = 
    (await prisma.permission.aggregate({
      where: {
        submitter_email: user.email!,
        due_to: {
          gte: new Date(),
        },
      },
      _count: {
        _all: true
      }
    }))._count._all || 0

  if (unconfirmedCount >= addNewCount) {
    res.status(400).json({ message: "Adding new deposit is not allowed." });
    return;
  }

  // filter confirmation data before storing
  try {
    const deposit = await prisma.deposit.create({
      data: {
        ...rest,
        submitter_department: user.department,
        submitter_title: user.title,
        submitter_id: user.id,
      },
    })
    res.json(deposit);
    return;
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
    return;
  }

}