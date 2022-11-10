import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // Process a POST request
    const data = await req.body; // deposit
    const { id } = data;
    console.log(data);
    try {
      const deposit = await prisma.deposit.update({
        where: {
          id,
        },
        data
      })
      res.json(deposit);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  } else {
    // Handle any other HTTP methods
    res.status(400).json({ message: "Bad HTTP method." });
  }
}