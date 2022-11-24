import type { NextApiRequest, NextApiResponse } from "next";
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { createDecipheriv, scrypt } from 'crypto';
import { promisify } from "util";
import { join } from "path";
import { promises as fs } from 'fs';
import { pipeline } from "stream/promises";
import { PrismaClient } from '@prisma/client'
import { minioClient } from "lib/mc";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({
      message: "Method Not Allowed",
    });
    return;
  }

  const user: any = req.session.user;

  const query = req.query;
  const { id } = query;
  const depositId: number = Number(id);

  if (!user?.isLoggedIn) {
    res.status(400).json({ message: "Access refused. User not logged in." });
    return;
  }
  
  const prisma = new PrismaClient()
  if (!user?.is_superuser) {
  
    const deposit: any = await prisma.deposit.findFirst({
      where: {
        id: depositId,
        submitter_id: user.id,
      }
    })

    if (Object.keys(deposit).length === 0) {
      res.status(400).json({ message: "Access refused. File does not belong to user." });
      return;
    }
  }
      
  const deposit: any = await prisma.deposit.findFirst({
    where: {
      id: depositId,
    }
  })

  if (Object.keys(deposit).length === 0) {
    res.status(400).json({ message: "Deposit cannot be found." });
    return;
  }

  // https://stackoverflow.com/questions/68490546/how-to-download-a-file-on-next-js-using-an-api-route
  // https://vercel.com/guides/loading-static-file-nextjs-api-route

  // Append folder name (deposit's id) to filename
  const objectName = deposit.id + '/' + deposit.new_filename;
  
  // const fileContents = await fs.readFile(downloadDir + data.id + '/' + data.new_filename, 'utf8');
  
  async function getObjectContents() {

    const promise = new Promise((resolve, reject) => {

      var buff:any = [];
      var size = 0;
      minioClient.getObject(
        process.env.MINIO_BUCKET || "thesis",
        objectName).then(function(dataStream) {
        dataStream.on('data', async function(chunk) {
          buff.push(chunk)
          size += chunk.length
        })
        dataStream.on('end', function() {
          console.log('End. Total size = ' + size)
          // console.log("End Buffer : " + buff)
  
          resolve(buff)
        })
        dataStream.on('error', function(err) {
          console.log(err)
          reject(err)
        })
      }).catch(reject);
  
    })
    return promise
  }

  const fileContents = await getObjectContents()

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${deposit.original_filename}`);
  await pipeline(fileContents, res);
        
}

export default withIronSessionApiRoute(handler, sessionOptions);