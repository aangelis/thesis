import type { User } from "./user";

import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from '@prisma/client'
import { NotAllowedOnNonLeafError } from "ldapjs";

const prisma = new PrismaClient()

export default withIronSessionApiRoute(loginRoute, sessionOptions);

async function loginRoute(req: NextApiRequest, res: NextApiResponse) {
  const { email, password } = await req.body;

  try {

    const requestBody = {
      email,
      password,
      }
    const result = await fetch("http://localhost:3000/api/dummyldap",
      {
      method: "POST",
      headers:new Headers({
          "Content-Type": "application/json"
      }),
      body: JSON.stringify(requestBody)
    });

    if (result.ok) {
      // User data from ldap rest API endpoint
      const userData: User = await result.json();

      // Check if user data already exists in DB
      const userDB = await prisma.user.findMany({
        where: {
          email,
        },
      })
      // Rename remaining properties variable when object destructuring (spreading) userData
      const { id: userId, email: ldapEmail, username: ldapUsername, ...userDataStripped } = userData;
      // Cast Null Value to String 
      const username = (ldapUsername || "").toString();
      if (userDB.length > 0) {
        // User data already exists in DB. Data will be updated.
        const updateUser = await prisma.user.update({
          where: {
            email,
          },
          data: { username, ...userDataStripped, last_login: new Date() },
        });
      } else {
        // Store user data in DB.
        const updateUser = await prisma.user.create({
          data: { email, username, ...userDataStripped, last_login: new Date() },
        });        
      }
      const user = { ...userData, isLoggedIn: true } as User;
      req.session.user = user;
      await req.session.save();
      res.json(user);

    } else if (result.status === 401) {

      res.status(401).json({ message: "Wrong credentials." });

    } else {
      

      console.log(result);

      
      //res.status(result.status).json({ result });
    }


   

  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
}
