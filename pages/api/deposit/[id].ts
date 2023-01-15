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
  const ip = req.socket.remoteAddress;

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
      id: null,
      confirmed: false,
      submitter_id: null,
    }

  if (!dbStoredDepositData.id) {
    res.status(400).json({ message: "Deposit data not found." });
    return;
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

    const {
      confirmed,
      // confirmed_timestamp,
      comments,
      submitter_department,
      submitter_title,
      ...rest
    } = data;

    if (id !== data.id) {
      res.status(400).json({ message: "Invalid input data." });
      return;
    }

    const isKeywordsElValid = (str: string | null | undefined): boolean => {
      if (!str) {
        return true;
      }
      if (str.length === 0) {
        return true;
      }
      return (/^[, \u0370-\u03FF\u1F00-\u1FFF]*$/.test(str));
    }
  
    const isKeywordsEnValid = (str: string | null | undefined): boolean => {
      if (!str) {
        return true;
      }
      if (str.length === 0) {
        return true;
      }
      return (/^[, A-Za-z]*$/.test(str));
    }
    
    const depositSchema = yup.object().shape({
      id: yup.number().integer().required().positive(),
      title: yup.string().required(),
      title_el: yup.string().required(),
      title_en: yup.string().required(),
      abstract_el: yup.string().test((val) => val!.toString().length >= 0),
      abstract_en: yup.string().test((val) => val!.toString().length >= 0),
      keywords_el: yup.string().test(val => {
        return (val!.toString().length >= 0 && isKeywordsElValid(val))
      }),
      keywords_en: yup.string().test(val => {
        return (val!.toString().length >= 0 && isKeywordsEnValid(val))
      }),
      pages: yup.number().integer().required().min(0),
      language: yup.string().test((val) => val!.toString().length > 0),
      images: yup.number().integer().required().min(0),
      tables: yup.number().integer().required().min(0),
      diagrams: yup.number().integer().required().min(0),
      maps: yup.number().integer().required().min(0),
      drawings: yup.number().integer().required().min(0),
      confirmed: yup.boolean().required(),
      // confirmed_timestamp: yup.string().nullable()
      // .test(dateString => 
      //   ((dateString === null) ||
      //   ((new Date(dateString!).toString() !== 'Invalid Date')
      //   && (new Date(dateString!) >= new Date())))
      // ),
      license: yup.string().test((val) => val!.toString().length > 0),
      comments: yup.string().test((val) => val!.toString().length >= 0),
      supervisor: yup.string().test((val) => val!.toString().length >= 0),
    }).noUnknown();
  
    if (!(depositSchema.isValidSync(data, { abortEarly: true, strict: true, }))) {
      res.status(400).json({ message: "Invalid input data." });
      return;
    }

    if (user.isLibrarian && dbStoredDepositData?.confirmed) {
      res.status(400).json({ message: "Deposit confirmation data cannot be updated." });
      return;
    }

    if (user.isLibrarian) {
      try {
        const storedDeposit = await prisma.deposit.findUnique({
          where: {
            id
          },
        })
        const updateDeposit = await prisma.deposit.update({
          where: {
            id
          },
          // data: filteredData
          data: {
            confirmed,
            confirmed_timestamp: new Date(),
            comments,
          }
        })

        console.log(`${ip} - [${new Date()}] - deposit update - deposit with id ${updateDeposit.id} updated.`)

        const depositConfirmed = updateDeposit?.confirmed;
        const commentsUpdated = storedDeposit?.comments !== updateDeposit.comments
        const { logMessage, emailTitle, emailMessage } = depositConfirmed?
          {
            logMessage: `deposit with id ${updateDeposit.id} confirmed.`,
            emailTitle: 'Επιβεβαίωση απόθεσης',
            emailMessage: `Η απόθεση με τίτλο \"${updateDeposit.title_el}\" επιβεβαιώθηκε.`,
          }
          : commentsUpdated?
            {
              logMessage: `comments in deposit with id ${updateDeposit.id} updated.`,
              emailTitle: 'Νέο σχόλιο στην απόθεση',
              emailMessage: `Υπάρχει ένα νέο σχόλιο στην απόθεση με τίτλο \"${updateDeposit.title_el}\".`,
            }
            :
            { logMessage: ' ', emailTitle: ' ', emailMessage: ' ' };

        console.log(`${ip} - [${new Date()}] - deposit update - ${logMessage}`)

        const updateUser = await prisma.user.findUnique({
          where: {
            id: updateDeposit.submitter_id,
          }
        })

        // ensure that fullname is populated with LDAP or user provided data
        const fullname =
        updateUser?.name_el && updateUser?.surname_el?
          updateUser?.name_el + ' ' + updateUser?.surname_el
          :
          updateUser?.first_name + ' ' + updateUser?.last_name;

        const proto =
          req.headers["x-forwarded-proto"] || req.connection.encrypted
            ? "https"
            : "http";
        const localHostname = 
          req.headers["x-forwarded-host"] || req.headers.host;
    
        await fetch(
          proto + '://' + localHostname + '/api/email',
          {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(
              {
                fullname,
                email: updateUser?.email,
                subject: emailTitle,
                text: emailMessage,
              }
            ),
          }
        )
        .then(() => {
          console.log(`${ip} - [${new Date()}] - deposit update - email sent for deposit update with id ${updateDeposit.id}.`)
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
      console.log(`${ip} - [${new Date()}] - deposit update - deposit with id ${updateDeposit.id} updated.`)
      res.json(updateDeposit);
      return;
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
      return;
    }

  }

}