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
    return (/^[, \u0370-\u03FF\u1F00-\u1FFF]*$/.test(str));
  }

  const isKeywordsEnValid = (str: string | null | undefined): boolean => {
    if (!str) {
      return true;
    }
    if (str.length === 0) {
      return true;
    }
    return (/^[, A-Za-z]*$/.test(str));
  }

  const depositSchema = yup.object().shape({
    title: yup.string().required(),
    title_el: yup.string().required(),
    title_en: yup.string().required(),
    abstract_el: yup.string().test(val => val!.toString().length >= 0),
    abstract_en: yup.string().test(val => val!.toString().length >= 0),
    keywords_el: yup.string().test(val => {
      return (val!.toString().length >= 0 && isKeywordsElValid(val))
    }),
    keywords_en: yup.string().test(val => {
      return (val!.toString().length >= 0 && isKeywordsEnValid(val))
    }),
    pages: yup.number().integer().required().min(0),
    language: yup.string().test(val => val!.toString().length > 0),
    images: yup.number().integer().required().min(0),
    tables: yup.number().integer().required().min(0),
    diagrams: yup.number().integer().required().min(0),
    maps: yup.number().integer().required().min(0),
    drawings: yup.number().integer().required().min(0),
    confirmed: yup.boolean().required(),
    confirmed_timestamp: yup.string().nullable()
    .test(dateString => 
      ((dateString === null) ||
      ((new Date(dateString!).toString() !== 'Invalid Date')
      && (new Date(dateString!) >= new Date())))
    ),
    license: yup.string().test((val) => val!.toString().length > 0),
    comments: yup.string().test((val) => val!.toString().length >= 0),
    supervisor: yup.string().test((val) => val!.toString().length >= 0),
  }).noUnknown();

  if (!(depositSchema.isValidSync(data, { abortEarly: true, strict: true, }))) {
    res.status(400).json({ message: "Invalid input data." });
    return;
  }

  

  // if (id) {
  //   res.status(400).json({ message: "Adding new deposit failed. Provided id input." });
  //   return;
  // }

  // if (data.submitter_id !== user.id) {
  //   res.status(400).json({ message: "Deposit must be owned by submitter." });
  //   return;
  // }

  // if (
  //   !data.title_el ||
  //   !data.title_en ||
  //   data.title_el === "" ||
  //   data.title_en === "" ||
  //   isNaN(+data.pages) ||
  //   isNaN(+data.images) ||
  //   isNaN(+data.tables) ||
  //   isNaN(+data.diagrams) ||
  //   isNaN(+data.maps) ||
  //   isNaN(+data.drawings) ||
  //   Number(data.pages) < 0 ||
  //   Number(data.images) < 0 ||
  //   Number(data.tables) < 0 ||
  //   Number(data.diagrams) < 0 ||
  //   Number(data.maps) < 0 ||
  //   Number(data.drawings
  // ) < 0) {
  //   res.status(400).json({ message: "Invalid input data." });
  //   return;
  // }
  
  // interface FilteredData {
  //   [key: string]: any; 
  // }
  // const filteredData: FilteredData = {};
  // filter data and keep only the required three key value pairs
  // const selectedKeys = ["id", "confirmed", "confirmed_timestamp"];
  // Object.entries(data)
  //   .filter(([k,v]) => selectedKeys.includes(k))
  //   .forEach(([k,v]) => filteredData[k]=v);

  
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
          // gte: new Date('2022-12-26'),
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