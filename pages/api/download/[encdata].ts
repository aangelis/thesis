import type { NextApiRequest, NextApiResponse } from "next";
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { createDecipheriv, scrypt } from 'crypto';
import { promisify } from "util";
import { join } from "path";
import { promises as fs } from 'fs';
import { pipeline } from "stream/promises";
import { PrismaClient } from '@prisma/client'

function tryParseJSONObject (jsonString: string){
  try {
      var o = JSON.parse(jsonString);

      // Handle non-exception-throwing cases:
      // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
      // but... JSON.parse(null) returns null, and typeof null === "object", 
      // so we must check for that, too. Thankfully, null is falsey, so this suffices:
      if (o && typeof o === "object") {
          return o;
      }
  }
  catch (e) { }

  return {};
};

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

  if (!user?.isLoggedIn) {
    res.status(400).json({ message: "Access refused. User not logged in." });
    return;
  }

  const { encdata } = req.query

  if (encdata === (undefined || null)) {
    res.status(400).json({message: "No input data"});
    return;
  }

  const iv = Buffer.from(process.env.ENCRYPTION_RANDOM_BYTES as string || "bafc0c62416f50d567dd198359e79937", 'hex');
  const password: string = process.env.ENCRYPTION_PRIVATE_KEY as string || "mP3LHZRRjRmP3LHZRRjR"
  const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;

  const encryptedBuffer_ = Buffer.from(encdata as string, 'hex');
  const decipher = createDecipheriv('aes-256-ctr', key, iv);
  const decryptedText = Buffer.concat([
    decipher.update(encryptedBuffer_),
    decipher.final(),
  ]);

  const data = tryParseJSONObject(decryptedText.toString())

  if (Object.keys(data).length === 0
    || isNaN(+data.id)
    || data.new_filename === undefined
    || data.original_filename === undefined) {
    res.status(400).json({message: "Invalid data"});
    return;
  }

  if (!user?.is_superuser) {
    const prisma = new PrismaClient()
  
    const deposit: any = await prisma.deposit.findFirst({
      where: {
        id: data.id,
        submitter_id: user.id,
      }
    })

    if (Object.keys(deposit).length === 0) {
      res.status(400).json({ message: "Access refused. File does not belong to user." });
      return;
    }
  }

  const downloadDir = join(
    process.env.ROOT_DIR || process.cwd(),
    '/uploads/'
  );
      
  // https://stackoverflow.com/questions/68490546/how-to-download-a-file-on-next-js-using-an-api-route
  // https://vercel.com/guides/loading-static-file-nextjs-api-route

  const fileContents = await fs.readFile(downloadDir + data.id + '/' + data.new_filename, 'utf8');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${data.original_filename}`);
  await pipeline(fileContents, res);
        
}

export default withIronSessionApiRoute(handler, sessionOptions);