import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from '@prisma/client'
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";

export default withIronSessionApiRoute(handler, sessionOptions);

const prisma = new PrismaClient()

async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (!req.session.user?.isLoggedIn) {
    res.status(400).json({ message: "Access refused. User not logged in." });
  }

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