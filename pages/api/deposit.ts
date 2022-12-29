import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from '@prisma/client'
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { User } from "pages/api/user";

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
  
  // Process a POST request
  const data = await req.body; // deposit
  const { id, confirmed, confirmed_timestamp, comments, ...rest } = data;

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
    res.status(400).json({ message: "Invalid data." });
    return;
  }
  
  // interface FilteredData {
  //   [key: string]: any; 
  // }

  // const filteredData: FilteredData = {};

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

  if (!user?.isLibrarian && id) {

    try {
      const dbDepositData = await prisma.deposit.findUnique({
        where: {
          id
        }
      })
      // Check if deposit belongs to user before update
      if (!user.isLibrarian && dbDepositData?.submitter_id !== user.id) {
        res.status(400).json({ message: "User cannot modify this deposit." });
        return;
      }
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
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
        data: rest
      })
      res.json(deposit);
    }
    return;
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
    return;
  }
  
}