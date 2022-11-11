import { NextApiRequest, NextApiResponse } from "next";

import ldap from 'ldapjs';

/*
API Routes do not specify CORS headers, meaning they are same-origin only by default.
You can customize such behavior by wrapping the request handler
with the CORS request helpers.
https://github.com/vercel/next.js/blob/canary/examples/api-routes-cors/pages/api/cors.ts
*/

export default async function handler(req: NextApiRequest, response: NextApiResponse) {
  const { email, password } = await req.body;
  const ip = req.socket.remoteAddress
  const now = new Date()

  if (req.method === "POST") {
    // Process a POST request
    const { username, password } = await req.body;

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
        console.log(`${ip} - [${now}] - success - ${email}`);
        response.status(200).json( value );
      },
      (error) => {
        console.log(`${ip} - [${now}] - failure - ${email}`);
        response.status(401).json({ message: error });
      }
    );
  } else {
    // Handle any other HTTP method
    console.error(`${ip} - [${now}] - failure - - Bad HTTP method`);
    response.status(400).json({ message: "Bad HTTP method." });
  }
}