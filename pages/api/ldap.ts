import { NextApiRequest, NextApiResponse } from "next";

import ldap from 'ldapjs';

/*
API Routes do not specify CORS headers, meaning they are same-origin only by default.
You can customize such behavior by wrapping the request handler
with the CORS request helpers.
https://github.com/vercel/next.js/blob/canary/examples/api-routes-cors/pages/api/cors.ts
*/

export default async function handler(req: NextApiRequest, response: NextApiResponse) {
  const ip = req.socket.remoteAddress

  const validateEmail = (m: string) => {
    return String(m)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  }

  if (req.method === "POST") {
    // Process a POST request
    const data = await req.body; // email and password data
    const dataEntries = Object.entries(data);

    // check count of input data keys
    if (dataEntries.length !== 2) {
      console.log(`${ip} - [${new Date()}] - LDAP endpoint - Invalid input data.`)
      response.status(400).json({ message: "Invalid input data." });
      return;
    }

    dataEntries.forEach(([k,v], i) => {
      if(typeof v !== 'string') {
        console.log(`${ip} - [${new Date()}] - LDAP endpoint - Invalid input data.`)
        response.status(400).json({ message: "Invalid input data." });
        return;
      }
    });

    const { email, password } = data;

    if (email.split('@')[1] !== 'hua.gr') {
      console.log(`${ip} - [${new Date()}] - LDAP endpoint - Invalid email.`)
      response.status(401).json({ message: "Invalid email." });
      return;
    }

    const validEmail = validateEmail(email);
    if (validEmail === null) {
      console.log(`${ip} - [${new Date()}] - LDAP endpoint - Invalid email.`)
      response.status(401).json({ message: "Invalid email." });
      return;
    }
    
    const username = email.split('@')[0];

    const client = ldap.createClient({
      url: process.env.LDAP_HOST as string,
    });

    const entries: ldap.SearchEntry[] = [];

    return new Promise((resolve, reject) => {
      client.bind(
        process.env.LDAP_DN as string,
        process.env.LDAP_PASSWORD as string,
        (error) => {
          if (error) {
            reject("LDAP bound failed");
          } else {
            const opts: ldap.SearchOptions = {
              filter: `(&(sAMAccountName=${username}))`,
              scope: "sub",
              // limit attributes
              attributes: ["sAMAccountName", "givenName", "sn", "displayName", "mail", "title", "department"],
            };
            client.search(
              process.env.LDAP_BASE_DN as string,
              opts,
              (err, res) => {
                if (err) {
                  reject(`User ${username} LDAP search error`);
                } else {
                  res.on("searchRequest", (searchRequest) => {
                  });
                  res.on("searchEntry", (entry) => {
                    entries.push(entry);
                    client.bind(entry.dn, password, (err, res) => {
                      if (err) {
                        reject("Wrong credentials provided.");
                      } else {
                        resolve({
                          email: entries[0].object.mail,
                          //entries[0].attributes.find(x => x.type === "mail")?.vals[0],
                          username: entries[0].object.sAMAccountName,
                          first_name: entries[0].object.givenName,
                          last_name: entries[0].object.sn,
                          full_name: entries[0].object.displayName,
                          title: entries[0].object.title,
                          department: entries[0].object.department,
                        });
                      }
                    });
                  });
                  res.on("searchReference", (referral) => {
                  });
                  res.on("error", (err) => {
                    reject("LDAP SEARCH error");
                  });
                  res.on("end", (result) => {
                    if (entries.length == 0) {
                      reject("Wrong credentials provided.");
                    }
                  // removed else on res end, reply data with client.bind
                  // search.on('end') fires before the entry is found #378 
                  // https://github.com/ldapjs/node-ldapjs/issues/378
                  });
                }
              }
            );
          }
        }
      );
    }).then(
      (value) => {
        console.log(`${ip} - [${new Date()}] - LDAP success - ${email}`);
        response.status(200).json( value );
      },
      (error) => {
        console.log(`${ip} - [${new Date()}] - LDAP failure - ${email}`);
        response.status(401).json({ message: error });
      }
    );
  } else {
    // Handle any other HTTP method
    console.error(`${ip} - [${new Date()}] - LDAP failure - - Bad HTTP method`);
    response.status(400).json({ message: "Bad HTTP method." });
  }
}