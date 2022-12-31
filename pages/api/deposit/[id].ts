import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from '@prisma/client'
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { User } from "pages/api/user";

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
      confirmed: false,
      submitter_id: null,
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

    const { id, confirmed, confirmed_timestamp, comments, ...rest } = data;

    if (
      !data.title_el ||
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
      Number(data.drawings) < 0
    ) {
      res.status(400).json({ message: "Invalid input data." });
      return;
    }

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