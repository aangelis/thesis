import type { NextApiRequest } from "next";
import mime from "mime";
import { join } from "path";
import * as dateFn from "date-fns";
import formidable from "formidable";
import { mkdir, stat, rename, readdir, unlink } from "fs/promises";
import { PrismaClient } from '@prisma/client'
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";

const prisma = new PrismaClient()

export const FormidableError = formidable.errors.FormidableError;

export const parseForm = async (
  req: NextApiRequest
): Promise<{ depositId: string, url: string }> => {
// ): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return await new Promise(async (resolve, reject) => {

    const user: any = req.session.user;

    const uploadDir = join(
      process.env.ROOT_DIR || process.cwd(),
      `/uploads/`
    );

    const uploadDirTemp = join(
      uploadDir,
      `${dateFn.format(Date.now(), "dd-MM-Y")}`
    );

    try {
      await stat(uploadDirTemp);
    } catch (e: any) {
      if (e.code === "ENOENT") {
        await mkdir(uploadDirTemp, { recursive: true });
      } else {
        console.error(e);
        reject(e);
        return;
      }
    }

    // To avoid duplicate upload
    let filename = ""; 
    const form = formidable({
      maxFiles: 2,
      maxFileSize: 100 * 1024 * 1024, // 100 MegaBytes
      uploadDir: uploadDirTemp,
      filename: (_name, _ext, part) => {
        if (filename !== "") {
          return filename;
        }

        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        filename = `${part.name || "unknown"}-${uniqueSuffix}.${
          mime.getExtension(part.mimetype || "") || "unknown"
        }`;
        return filename;
      },
      filter: part => {
        return (
          part.name === "media" && (part.mimetype?.includes("application/pdf") || false)
        );
      },
    });

    // Extended form.parse to move file to final destination folder
    // form.parse(req, function (err, fields, files) {
    //   console.log({fields, files});
    //   if (err) reject(err);
    //   resolve({ fields, files });
    // });

    // Upload directory based on the form fields data in formidable
    // https://stackoverflow.com/questions/60519635/upload-directory-based-on-the-form-fields-data-in-formidable
    form.parse(req);

    let depositId: any;

    form.on("field", (name, value) => {
      // console.log({name, value});
      depositId = JSON.parse(value);
     

      prisma.deposit.findUnique({
        where: {
          id: depositId as unknown as number
        }
      })
      .then(deposit => {
        // Check if deposit belongs to user before update
        if (deposit?.submitter_id !== user.id) {
          // res.status(400).json({ data: null, error: "User cannot modify this deposit." });
          // TODO: delete uploaded file 
          reject("User cannot modify this deposit.");
        }
      }).catch (error => {
        // res.status(500).json({ data: null, error: (error as Error).message });
        reject((error as Error).message);
      })
     
      
    });

    form.on("file", (field, file) => {
      // console.log({field, file});
      let filePath = file.filepath;
      let destinationPath = filePath.split('uploads')[0] + `uploads/${depositId}/`;

      // Create destination directory using deposit ID
      stat(destinationPath)
      .catch(err => {
        if (err.code === "ENOENT") {
              mkdir(destinationPath, { recursive: true });
        } else {
          console.error(err);
        }
      })
      // Move the uploaded PDF file to new destination folder
      .finally(() => {
        // Fist find all files inside destination folder, delete them
        // and then move the uploaded file
        readdir(destinationPath)
        .then(f => Promise.all(f.map(e => unlink(destinationPath + e))))
        .then(() => rename(filePath, destinationPath + file.newFilename))
      })

      prisma.deposit.update({
        where: {
          id: depositId,
        },
        data: {
          new_filename: file.newFilename,
          original_filename: file.originalFilename,
        },
      })
      .then(result => {
        // console.log(result)
      })
      .catch(error => {
        console.error(error);
        reject(error);
      })
      .finally(() => {
        // console.log({ depositId, url: filePath });
        resolve({ depositId, url: filePath });
      })
        
    });

    form.on("end", () => {});

  });
};

export default withIronSessionApiRoute(parseForm, sessionOptions);
