import type { User } from "./user";

import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from '@prisma/client'
import { NotAllowedOnNonLeafError } from "ldapjs";

const prisma = new PrismaClient()

export default withIronSessionApiRoute(loginRoute, sessionOptions);

async function loginRoute(req: NextApiRequest, res: NextApiResponse) {
  
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({
      message: "Method Not Allowed",
    });
    return;
  }

  const { email, password } = await req.body;

  try {

    const requestBody = {
      email,
      password,
      }

    const validateEmail = (m: string) => {
      return String(m)
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    }

    if (email === "") {
      res.status(401).json({ message: "No email provided." });
      return;
    }
    if (password.length < (process.env.NEXT_PUBLIC_LOGIN_PASSWORD_MIN_LENGTH || 8)) {
      res.status(401).json({ message: "Invalid password length." });
      return;
    }
    if (email.split('@')[1] !== 'hua.gr') {
      res.status(401).json({ message: "Invalid email." });
      return;
    }
    const validEmail = validateEmail(email);
    if (validEmail === null) {
      res.status(401).json({ message: "Invalid email." });
      return;
    }

    const isAdminLogin = (
      process.env.LOGIN_ADMIN_EMAIL
      && process.env.LOGIN_ADMIN_EMAIL
      && email === process.env.LOGIN_ADMIN_EMAIL
      && password === process.env.LOGIN_ADMIN_PASSWORD
      );

    const result = isAdminLogin?
      { ok: true, status: 200, json: () => {
        return { 
          email: process.env.LOGIN_ADMIN_EMAIL,
          username: process.env.LOGIN_ADMIN_EMAIL?.split('@')[0],
          title: "Administrator staff",
          department: "Πληροφορικής και Τηλεματικής",
        }
      }}
      : await fetch(process.env.LOGIN_API_ENDPOINT as string,
        {
        method: "POST",
        headers:new Headers({
            "Content-Type": "application/json"
        }),
        body: JSON.stringify(requestBody)
      });

    if (result.ok) {
      const userData: User = await result.json();

      // Check if user data already exists in DB
      const userDB = await prisma.user.findFirst({
        where: {
          email,
        },
      })
      // Rename remaining properties variable when object destructuring (spreading) userData
      const { id: userId, email: ldapEmail, username: ldapUsername, ...userDataStripped } = userData;
      // Cast Null Value to String 
      const username = (ldapUsername || "").toString();
      if (userDB) {
        // User data already exists in DB. Data will be updated.
        const updateUser = await prisma.user.update({
          where: {
            email,
          },
          data: { username, ...userDataStripped, last_login: new Date() },
        });
        userData.id = updateUser.id;
      } else {
        // Store user data in DB.
        const storeUser = await prisma.user.create({
          data: { email, username, ...userDataStripped, last_login: new Date() },
        });
        userData.id = storeUser.id;
      }

      // static role assignments for development purposes
      // const roles = [
      //   { username: "ifigenia", isLibrarian: true  },
      //   { username: "tsadimas", isLibrarian: true, isSecretary: true, isAdmin: true  },
      //   { username: (process.env.LOGIN_ADMIN_EMAIL?.split('@')[0]), isLibrarian: true, isSecretary: true, isAdmin: true  },
      //   { username: "daneli", isSecretary: true },
      // ]
  
      // const currentUserRoles = roles.find((o) => {
      //   return (o.username === userData.username);
      // })
  
      // const isAdmin = currentUserRoles?.isAdmin ?? false;
      // const isSecretary = currentUserRoles?.isSecretary ?? false;
      // const isLibrarian = currentUserRoles?.isLibrarian ?? false;

      // Check if user data already exists in roles table
      const userRoles = isAdminLogin?
        { is_admin: true,  is_secretary: true, is_librarian: true, } 
        :
        await prisma.role.findFirst({
          where: {
            email,
            is_active: true,
          },
        })

      const isAdmin = userRoles?.is_admin ?? false;
      const isSecretary = userRoles?.is_secretary ?? false;
      const isLibrarian = userRoles?.is_librarian ?? false;

      const user = {
        ...userData,
        isLoggedIn: true,
        isAdmin,
        isSecretary,
        isLibrarian,
        is_superuser: isAdmin || isSecretary || isLibrarian, // must check what is_superuser means
      } as User;
      req.session.user = user;
      await req.session.save();
      res.json(user);
      return;

    } else if (result.status === 401) {

      res.status(401).json({ message: "Wrong credentials." });
      return;

    } else {
      

      console.log(result);
      return;

      
      //res.status(result.status).json({ result });
    }


   

  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
    return;
  }
}
