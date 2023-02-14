import { NextApiRequest, NextApiResponse } from "next";
import ldap from 'ldapjs';


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
      console.log(`${ip} - [${new Date()}] - LDAP endpoint - - Invalid input data.`)
      response.status(400).json({ message: "Invalid input data." });
      return;
    }

    dataEntries.forEach(([k,v], i) => {
      if(typeof v !== 'string') {
        console.log(`${ip} - [${new Date()}] - LDAP endpoint - - Invalid input data.`)
        response.status(400).json({ message: "Invalid input data." });
        return;
      }
    });

    const { email, password } = data;

    if (email.split('@')[1] !== 'hua.gr') {
      console.log(`${ip} - [${new Date()}] - LDAP endpoint - - Invalid email.`)
      response.status(401).json({ message: "Invalid email." });
      return;
    }

    const validEmail = validateEmail(email);
    if (validEmail === null) {
      console.log(`${ip} - [${new Date()}] - LDAP endpoint - - Invalid email.`)
      response.status(401).json({ message: "Invalid email." });
      return;
    }
    
    const username = email.split('@')[0];

    const client = ldap.createClient({
      url: process.env.LDAP_HOST as string,
      timeout: 400, // Milliseconds client should let operations live for before timing out (Default: Infinity)
      connectTimeout: 400, // Milliseconds client should wait before timing out on TCP connections (Default: OS default)
    });

    const entries: ldap.SearchEntry[] = [];

    return new Promise((resolve, reject) => {
      client.on('error', error => {
        console.debug('Connection to LDAP server failed');
      });
      client.on('timeout', error => {
        console.debug(`${ip} - [${new Date()}] - Connection to LDAP server timeout - ${email}`);
        reject('timeout');
      });
      client.on('connectTimeout', error => {
        console.debug(`${ip} - [${new Date()}] - TCP connection to LDAP server timeout - ${email}`);
        reject('connectTimeout');
      });
      client.bind(
        process.env.LDAP_DN as string,
        process.env.LDAP_PASSWORD as string,
        error => {
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
                  res.on("searchRequest", searchRequest => {
                  });
                  res.on("searchEntry", entry => {
                    entries.push(entry);
                    client.bind(entry.dn, password, (err, res) => {
                      if (err) {
                        reject("Wrong credentials provided.");
                      } else {
                        resolve({
                          email: entries[0].object.mail,
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
                  res.on("searchReference", referral => {
                  });
                  res.on("error", error => {
                    reject("LDAP SEARCH error");
                  });
                  res.on("end", result => {
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
      value => {
        console.log(`${ip} - [${new Date()}] - LDAP endpoint success - ${email}`);
        response.status(200).json( value );
      },
      error => {
        console.error(`${ip} - [${new Date()}] - LDAP endpoint failure - ${email}`);
        response.status(401).json({ message: error });
      }
    );
  } else {
    // Handle any other HTTP method
    response.setHeader("Allow", "POST");
    console.error(`${ip} - [${new Date()}] - LDAP endpoint failure - - Bad HTTP method`);
    response.status(400).json({ message: "Bad HTTP method." });
  }
}