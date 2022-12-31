import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from '@prisma/client'
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { User } from "pages/api/user";

export default withIronSessionApiRoute(handler, sessionOptions);

const prisma = new PrismaClient()

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST" && req.method !== "DELETE") {
    // Handle any other HTTP methods
    res.status(400).json({ message: "Bad HTTP method." });
    return;
  }
  const user: User = req.session.user!;

  if (!user?.isLoggedIn) {
    res.status(400).json({ message: "Access refused. User not logged in." });
    return;
  }
  
  // Process a POST request
  const data = await req.body; // deposit


  if (req.method === 'DELETE') {
    const { id } = data;

    if (isNaN(+id)) {
      res.status(400).json({ message: "Invalid input data." });
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

  if (req.method === 'POST') {
    const { id, confirmed, confirmed_timestamp, comments, ...rest } = data;

    if (!id && user.is_superuser) {
      res.status(400).json({ message: "Adding new deposit is not allowed." });
      return;
    }

    if (!data.title_el ||
        !data.title_en ||
        data.title_el === "" ||
        data.title_en === "" ||
        isNaN(+data.pages) ||
        isNaN(+data.images) ||
        isNaN(+data.tables) ||
        isNaN(+data.diagrams) ||
        isNaN(+data.maps) ||
        isNaN(+data.drawings) ||
        Number(data.pages) < 0 ||
        Number(data.images) < 0 ||
        Number(data.tables) < 0 ||
        Number(data.diagrams) < 0 ||
        Number(data.maps) < 0 ||
        Number(data.drawings) < 0) {
      res.status(400).json({ message: "Invalid input data." });
      return;
    }
    
    // interface FilteredData {
    //   [key: string]: any; 
    // }

    // const filteredData: FilteredData = {};

    const dbStoredDepositData = id? 
      (await prisma.deposit.findUnique({
        where: {
          id
        }
      }))
      :
      {
        confirmed: false,
        submitter_id: null,
      }

    if (user.isLibrarian && dbStoredDepositData?.confirmed) {
      res.status(400).json({ message: "Deposit confirmation data cannot be updated." });
      return;
    }

    if (user.isLibrarian) {
      // filter data and keep only the required three key value pairs
      // const selectedKeys = ["id", "confirmed", "confirmed_timestamp"];
      // Object.entries(data)
      //   .filter(([k,v]) => selectedKeys.includes(k))
      //   .forEach(([k,v]) => filteredData[k]=v);
      
      try {
        const deposit = await prisma.deposit.update({
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
        res.json(deposit);
        return;
      } catch (error) {
        res.status(500).json({ message: (error as Error).message });
        return;
      }
    }

    // Check if deposit belongs to user before update
    if (!user?.is_superuser && id && dbStoredDepositData?.submitter_id !== user.id) {
      res.status(400).json({ message: "User cannot modify this deposit." });
      return;
    }

    // Check is user can add a new deposit
    if (!id) {

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

    }

    // filter confirmation data before storing
    try {
      if (data.id) {
        const deposit = await prisma.deposit.update({
          where: {
            id,
          },
          data: rest
        })
        res.json(deposit);
      } else {
        const deposit = await prisma.deposit.create({
          data: {
            ...rest, submitter_id: user.id,
          },
        })
        res.json(deposit);
      }
      return;
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
      return;
    }
  }

  res.status(400).json({ message: "Bad request." });
  return;

}