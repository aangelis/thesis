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

  if (!user?.isSecretary) {
    res.status(400).json({ message: "Access refused. User does not have secretary role." });
    return;
  }

  const id = parseInt(req.query.id as string);

  if (isNaN(+id)) {
    res.status(400).json({ message: "Invalid input data." });
    return;
  }

  const dbStoredPermissionData =
    (await prisma.permission.findUnique({
      where: {
        id
      }
    }))
    || 
    {
      id: null,
      secretary_id: null,
    }

  if (!dbStoredPermissionData.id) {
    res.status(400).json({ message: "Permission data not found." });
    return;
  }

  if (req.method === 'DELETE') {
  
    if (dbStoredPermissionData.secretary_id !== user.id) {
      res.status(400).json({ message: "Permission can be deleted only by the owner." });
      return;
    }

    try {
      const deletePermission = await prisma.permission.delete({
        where: {
          id
        },
      })
      res.json(deletePermission);
      return;
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
      return;
    }
  
  }

  if (req.method === 'PATCH') {

    // Process a PATCH request data
    const data = await req.body; // permission

    const permissionSchema = yup.object().shape({
      id: yup.number().integer().required().positive(),
      submitter_email: yup.string().email().required()
        .test(m => m?.split('@')[1] === 'hua.gr'),
      // due_to: yup.date().min(new Date()).required(),
      // https://github.com/jquense/yup/issues/1218
      due_to: yup.string().required()
      .test(dateString => 
        ((new Date(dateString!).toString() !== 'Invalid Date')
        && (new Date(dateString!) >= new Date()))
      ),
    }).noUnknown();
    
    if (!(permissionSchema.isValidSync(data, { abortEarly: true, strict: true, }))) {
      res.status(400).json({ message: "Invalid input data." });
      return;
    }

    if (id !== data.id) {
      res.status(400).json({ message: "Invalid input data." });
      return;
    }

    if (user.id !== dbStoredPermissionData.secretary_id) {
      res.status(400).json({ message: "Permission can be updated only by the owner." });
      return;
    }

    // const validateEmail = (m: string) => {
    //   return String(m)
    //     .toLowerCase()
    //     .match(
    //       /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    //     );
    // }

    // if (!data.submitter_email ||
    //   data.submitter_email === "" ||
    //   data.submitter_email.split('@')[1] !== 'hua.gr' ||
    //   validateEmail(data.submitter_email) === null 
    // ) {
    //   res.status(400).json({ message: "Invalid input data." });
    //   return;
    // }

    try {
      const updatePermission = await prisma.permission.update({
        where: {
          id,
        },
        data
      })
      res.json(updatePermission);
      return;
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
      return;
    }

  }

}