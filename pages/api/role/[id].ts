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

  if (!user?.isAdmin) {
    res.status(400).json({ message: "Access refused." });
    return;
  }

  const id = parseInt(req.query.id as string);

  if (isNaN(+id)) {
    res.status(400).json({ message: "Invalid input data." });
    return;
  }

  const dbStoredRoleData =
    (await prisma.role.findUnique({
      where: {
        id
      }
    }))
    || 
    {
      id: null,
      secretary_id: null,
    }

  if (!dbStoredRoleData.id) {
    res.status(400).json({ message: "Role data not found." });
    return;
  }

  if (req.method === 'DELETE') {

    try {
      const deleteRole = await prisma.role.delete({
        where: {
          id
        },
      })
      res.json(deleteRole);
      return;
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
      return;
    }

  }

  if (req.method === 'PATCH') {

    // Process a PATCH request data
    const data = await req.body; // role

    const roleSchema = yup.object().shape({
      id: yup.number().integer().required().positive(),
      email: yup.string().email().required()
      .test(m => m?.split('@')[1] === 'hua.gr'),
      is_admin: yup.boolean().required(),
      is_secretary: yup.boolean().required(),
      is_librarian: yup.boolean().required(),
      is_active: yup.boolean().required(),
    }).noUnknown();
    
    if (!(roleSchema.isValidSync(data, { abortEarly: true, strict: true, }))) {
      res.status(400).json({ message: "Invalid input data." });
      return;
    }

    try {
      const role = await prisma.role.update({
        where: {
          id,
        },
        data
      })
      res.json(role);
      return;
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
      return;
    }

  }

}