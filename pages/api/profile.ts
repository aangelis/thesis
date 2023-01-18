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

  if (!user?.isLoggedIn) {
    res.status(400).json({ message: "Access refused. User not logged in." });
    return;
  }
  
  const id = user.id;

  // Process a POST request
  const data = await req.body; // profile

  const isFieldElValid = (str: string | null | undefined): boolean => {
    if (!str) {
      return true;
    }
    if (str.length === 0) {
      return true;
    }
    return (/^[ \u0370-\u03FF\u1F00-\u1FFF]*$/.test(str));
  }

  const isFieldEnValid = (str: string | null | undefined): boolean => {
    if (!str) {
      return true;
    }
    if (str.length === 0) {
      return true;
    }
    return (/^[ A-Za-z]*$/.test(str));
  }

  const dataEntries = Object.entries(data)
  // check count of input data keys
  if (dataEntries.length !== 6) {
    res.status(400).json({ message: "Invalid input data." });
    return;
  }
  // manual transform of fields values, transfrom in yup strict mode does not work
  dataEntries.forEach(([k,v], i) => {
    if(typeof v !== 'string') {
      res.status(400).json({ message: "Invalid input data." });
      return;
    }
    // Remove spaces and commas at the end and beginning of all key values
    (data as Record<typeof k, string|number>)[k] = data[k].replace(/^[,\s]+|[,\s]+$/g, '')
  })

  const permissionSchema = yup.object().shape({
    name_el: yup.string().test((val) => val!.toString().length > 0 && isFieldElValid(val)),
    name_en: yup.string().test((val) => val!.toString().length > 0 && isFieldEnValid(val)),
    surname_el: yup.string().test((val) => val!.toString().length > 0 && isFieldElValid(val)),
    surname_en: yup.string().test((val) => val!.toString().length > 0 && isFieldEnValid(val)),
    father_name_el: yup.string().test((val) => val!.toString().length > 0 && isFieldElValid(val)),
    father_name_en: yup.string().test(val => val!.toString().length > 0 && isFieldEnValid(val)),
  }).noUnknown();
  
  if (!(permissionSchema.isValidSync(data, { abortEarly: true, strict: true, }))) {
    res.status(400).json({ message: "Invalid input data." });
    return;
  }

  try {
    const profile = await prisma.user.update({
      where: {
        id,
      },
      data: {
        name_el: data.name_el!,
        name_en: data.name_en!,
        surname_el: data.surname_el!,
        surname_en: data.surname_en!,
        father_name_el: data.father_name_el!,
        father_name_en: data.father_name_en!,
      }
    })
    // store new user data to session
    req.session.user = {...user, ...data};
    await req.session.save();
    // return data
    res.json(data);
    return;
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
    return;
  }
  
}