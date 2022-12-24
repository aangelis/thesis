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

  if (!user?.isLoggedIn) {
    res.status(400).json({ message: "Access refused. User not logged in." });
    return;
  }
  
  const id = user.id;

  // Process a POST request
  const data = await req.body; // profile
  
  // TODO: object validation
  // if () {
  //   res.status(400).json({ message: "Invalid data." });
  //   return;
  // }

  try {
    const profile = await prisma.user.update({
      where: {
        id,
      },
      data
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