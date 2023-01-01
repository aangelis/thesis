import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from '@prisma/client'
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { User } from "pages/api/user";
import * as yup from 'yup';

export default withIronSessionApiRoute(handler, sessionOptions);

const prisma = new PrismaClient()

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PATCH" && req.method !== "DELETE") {
    // Handle any other HTTP methods
    res.status(400).json({ message: "Bad HTTP method." });
    return;
  }
  const user: User = req.session.user!;

  if (!user?.isLoggedIn) {
    res.status(400).json({ message: "Access refused. User not logged in." });
    return;
  }

  const id = parseInt(req.query.id as string);

  if (isNaN(+id)) {
    res.status(400).json({ message: "Invalid input data." });
    return;
  }

  const dbStoredDepositData =
    (await prisma.deposit.findUnique({
      where: {
        id
      }
    }))
    || 
    {
      id: null,
      confirmed: false,
      submitter_id: null,
    }

  if (!dbStoredDepositData.id) {
    res.status(400).json({ message: "Deposit data not found." });
    return;
  }

  if (req.method === 'DELETE') {

    if (dbStoredDepositData.submitter_id !== user.id) {
      res.status(400).json({ message: "Deposit can be deleted only by submitter." });
      return;
    }

    try {
      const deleteDeposit = await prisma.deposit.delete({
        where: {
          id
        },
      })
      res.json(deleteDeposit);
      return;
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
      return;
    }

  }

  if (req.method === 'PATCH') {

    // Process a PATCH request data
    const data = await req.body; // deposit

    const {
      confirmed,
      confirmed_timestamp,
      comments,
      submitter_department,
      submitter_title,
      ...rest
    } = data;

    if (id !== data.id) {
      res.status(400).json({ message: "Invalid input data." });
      return;
    }

    const depositSchema = yup.object().shape({
      id: yup.number().integer().required().positive(),
      title: yup.string().required(),
      title_el: yup.string().required(),
      title_en: yup.string().required(),
      abstract_el: yup.string().test((val) => val!.toString().length >= 0),
      abstract_en: yup.string().test((val) => val!.toString().length >= 0),
      pages: yup.number().integer().required().min(0),
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
      license: yup.string().test((val) => val!.toString().length >= 0),
      comments: yup.string().test((val) => val!.toString().length >= 0),
      supervisor: yup.string().test((val) => val!.toString().length >= 0),
    }).noUnknown();
  
    if (!(depositSchema.isValidSync(data, { abortEarly: true, strict: true, }))) {
      res.status(400).json({ message: "Invalid input data." });
      return;
    }

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
    //   Number(data.drawings) < 0
    // ) {
    //   res.status(400).json({ message: "Invalid input data." });
    //   return;
    // }

    if (user.isLibrarian && dbStoredDepositData?.confirmed) {
      res.status(400).json({ message: "Deposit confirmation data cannot be updated." });
      return;
    }

    if (user.isLibrarian) {
      try {
        const updateDeposit = await prisma.deposit.update({
          where: {
            id
          },
          // data: filteredData
          data: {
            confirmed,
            confirmed_timestamp,
            comments,
          }
        })
        res.json(updateDeposit);
        return;
      } catch (error) {
        res.status(500).json({ message: (error as Error).message });
        return;
      }
    }

    // Check if deposit belongs to submitter before update
    if (!user?.is_superuser && id && dbStoredDepositData?.submitter_id !== user.id) {
      res.status(400).json({ message: "User cannot modify this deposit." });
      return;
    }

    // update deposit without confirmation data
    try {
      const updateDeposit = await prisma.deposit.update({
        where: {
          id,
        },
        data: rest
      })
      res.json(updateDeposit);
      return;
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
      return;
    }

  }

}