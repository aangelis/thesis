import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from '@prisma/client'
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { minioClient } from "lib/mc";
import fetch from 'node-fetch'
import FormData from 'form-data';
import fs from 'fs';

export default withIronSessionApiRoute(handler, sessionOptions);

const prisma = new PrismaClient()

const settings = {
  username: process.env.MDS_USERNAME || "",
  password: process.env.MDS_PASSWORD || "",
  BURL: process.env.MDS_ENDPOINT || "",
  token: null,
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    // Handle any other HTTP methods
    res.status(400).json({ message: "Bad HTTP method." });
    return;
  }

  if (settings.username === "" || settings.password === "" || settings.BURL === "") {
    res.status(500).json({ message: "API iternal error." });
    return;
  }

  interface Data {
    deposit_id: number;
  };

  const data: Data = await req.body;

  if (isNaN(+data.deposit_id)) {
    res.status(400).json({ message: "Invalid input data." });
    return;
  }

  const ip = req.socket.remoteAddress;

  try {

    const dbStoredDepositData =
      (await prisma.deposit.findUnique({
        where: {
          id: data.deposit_id,
        }
      }))

    if (!dbStoredDepositData) {
      res.status(400).json({ message: "Invalid input data." });
      return;
    }

    if (!dbStoredDepositData.confirmed) {
      res.status(400).json({ message: "Unconfirmed deposit cannot be uploaded."});
      return;
    }

    const dbStoredUserData = 
      (await prisma.user.findUnique({
        where: {
          id: dbStoredDepositData.submitter_id,
        }
      }))

    // Test runs:
    // 01
    // const person = await get_person("Σοφία, Αγραφιώτη");
    // res.json({person})
    // success. output:
    // {"person":"15266"}
    // 02
    // const language_id = await get_language('Ελληνικά');
    // res.json({language_id})
    // success. output:
    // {"language_id":"67"}
    // 03
    // const root_col_id = await get_root_path_id();
    // res.json({root_col_id})
    // success. output:
    // {"root_col_id":"31"}
    // 04
    // const department_id = await get_department_id('Τμήμα ' + 'Πληροφορικής και Τηλεματικής', 31);
    // res.json({department_id})
    // success. output:
    // {"department_id":"44"}
    // 05
    // const deposit_col_id = await get_deposit_col_id(44, 'Μεταπτυχιακές Εργασίες');
    // res.json({deposit_col_id})
    // success. output:
    // {"deposit_col_id":"46"}
    // 06
    // const licenses = await get_licenses();
    // res.json({licenses})
    // success. output:
    // {"licenses":[{"id":"19424","prototype":"/butte ...
    // 07
    // const license_id = await get_license('Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0');
    // res.json({license_id})
    // success. output:
    // {"license_id":"19429"}
    // 08
    // const item_data = await get_item_data(1228);
    // res.json({item_data});
    // success. output:
    // {"item_data":{"id":"1228","prototype":"/butterfly/backie/gr ...
    // 09
    // const uploaded_file = await upload_file(1228, dbStoredDepositData)
    // res.json({uploaded_file});
    // success. output:
    // {"uploaded_file":true}

    const depositData = deposit(dbStoredUserData, dbStoredDepositData);

    if (depositData.id) {
      if (depositData.uploaded_file) {
        res.json({ message: "Η απόθεση ολοκληρώθηκε."});
      } else {
        res.json({ message: "Η απόθεση ολοκληρώθηκε αλλά το αρχείο δεν ανέβηκε."});
      }
    } else {
      res.status(400).json({ message: "Η απόθεση δεν πραγματοποιήθηκε."});
    }
    return;

  }
  catch (error) {
    console.log("main catch ")
    console.log(error);
    if ((error as Error).name === "AbortError") {
      res.status(500).json({ message: 'Request timeout.' });
      return;
    }
    res.status(500).json({ message: (error as Error).message });
    return;
  }

}

async function fetchJson(resource: string, options: any) {
  const { timeout = 2000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal  
  })
  .then(handleErrors)
  .then(r => r.text())
  .then(r => {
    if (r.length === 0) {
      throw new Error('No server response data.')
    }
    return r;
  })
  .then(r => {return tryParseJSONObject(r)});
  
  clearTimeout(id);
  return response;
}

const handleErrors = (response: any) => {
  if (!response.ok) {
    // response.status
    throw new Error('Server response error.');
  }
  return response;
}

const tryParseJSONObject: any = (jsonString: any) => {
  try {
      const o = JSON.parse(jsonString);
      if (o && typeof o === "object") {
          return o;
      }
  }
  catch (e) {
    throw new Error('Invalid JSON formatted server response data.')
  }

  throw new Error('Invalid JSON formatted server response data.')
  // return null;
};

const get_token: any = async () => {
  return await get_token_(settings.username, settings.password, settings.BURL)
}

const get_token_: any = async (username: string, password: string, url: string) => {
  const headers = {
    // 'Content-Type': 'application/x-www-form-urlencoded',
  };
  const payload = { username, password, };
  return await fetchJson(url + '/authenticate', {
    method: 'POST',
    headers,
    body: new URLSearchParams(payload),
  })
  .then(response => response.token)

}

const get_person: any = async (person_el: string) => {
  return get_person_(person_el, settings.BURL);
}

const get_person_ : any = async (person_el: string, url: string) => {
  if (!settings.token) {
    settings.token = await get_token();
  }
  const token = settings.token;
  const headers = {
    'x-butterfly-session-token': token!,
  };
  const payload = {
    'proto': '/butterfly/backie/term_person',
    'text': person_el,
    'count': '1',
  };
  console.log(headers,payload)
  return await fetchJson(url + '/search', {
    method: 'POST',
    headers, 
    body: new URLSearchParams(payload),
  })
  .then(response => {
    return response['results'][0]['id'] as unknown as number;
  })
}

const add_person : any = async (person_el: string, person_en: string) => {
  return add_person_(person_el, person_en, settings.BURL);
}

const add_person_ = async (person_el: string, person_en: string, url: string) => {
  if (!settings.token) {
    settings.token = await get_token();
  }
  const token = settings.token;
  const headers = {
    'x-butterfly-session-token': token!,
  };
  const payload = {
    'proto': '/butterfly/backie/term_person',
    's': '/lib/default/data',
    'p': '/butterfly/backie/term_person',
    'rootRefPath': '/lib/default/data/thes_person',
    'parentRefPath': '/lib/default/data/thes_person',
    'term.en': person_en,
    'term.el': person_el,
  };
  return await fetchJson(url + '/items', {
      method: 'POST',
      headers, 
      body: new URLSearchParams(payload),
  })
  .then(response => {
    return (
      response['results'][0]['id']?
      response['results'][0]['id'] : response['id']
    ) as unknown as number;
  });
}

const get_language: any = async (language: string) => {
  return get_language_(language, settings.BURL);
}

const get_language_: any = async (language: string, url: string) => {
  if (!settings.token) {
    settings.token = await get_token();
  }
  const token = settings.token;
  const headers = {
    'x-butterfly-session-token': token!,
  };
  const payload = {
    'proto': '/butterfly/backie/term',
    'text': language,
    'parentRefPath': '/lib/default/data/thes_language',
    'count': '1',
  };
  return await fetchJson(url + '/search', {
    method: 'POST',
    headers, 
    body: new URLSearchParams(payload),
  })
  .then(response => {
    return response['results'][0]['id'] as unknown as number;
  });
}

const get_root_path_id: any = async () => {
  return get_root_path_id_(settings.BURL);
}

const get_root_path_id_: any = async (url: string) => {
  if (!settings.token) {
    settings.token = await get_token();
  }
  const token = await settings.token;
  const headers = {
    'x-butterfly-session-token': token!,
  };
  const payload = {
    'proto': '/butterfly/backie/collection',
    'text': 'Γκρίζα Βιβλιογραφία Χαροκοπείου Πανεπιστημίου',
    'isRoot': 'true',
  };
  return await fetchJson(url + '/search', {
    method: 'POST',
    headers, 
    body: new URLSearchParams(payload),
  })
  .then(response => {
    return response['results'][0]['id'] as unknown as number;
  });
}

const get_item_data = async (item_id: number) => {
  return get_item_data_(item_id, settings.BURL);
}

const get_item_data_ = async (item_id: number, url: string) => {
  if (!settings.token) {
    settings.token = await get_token();
  }
  const token = settings.token;
  const headers = {
    'x-butterfly-session-token': token!,
  };
  return await fetchJson(url + '/items/lib/default/data/' + item_id as string, {
    method: 'GET',
    headers, 
  })
  .then(response => {
    return response['results'][0]['id'] as unknown as number;
  });
}


const get_department_id: any = async (department: string, root_col_id: number) => {
  return get_department_id_(department, root_col_id, settings.BURL);
}

const get_department_id_: any = async (department: string, root_col_id: number, url: string) => {
  if (!settings.token) {
    settings.token = await get_token();
  }
  const token = settings.token;
  const payloadDepartment =
    department.search('Διαιτολογίας') >= 0? 
     "Τμήμα Επιστήμης Διαιτολογίας-Διατροφής"
     : department.search('Οικονομίας') >= 0?
        "Τμήμα  Οικονομίας και Βιώσιμης Ανάπτυξης"
        : department
  const headers = {
    'x-butterfly-session-token': token!,
  };
  const payload = {
    'proto': '/butterfly/backie/collection',
    'parentRefPath': '/lib/default/data/' + root_col_id.toString(),
    'searchField.title.el': payloadDepartment,
  };
  return await fetchJson(url + '/search', {
    method: 'POST',
    headers, 
    body: new URLSearchParams(payload),
  })
  .then(response => {
    return response['results'][0]['id'] as unknown as number;
  });
}

const get_deposit_col_id: any = async (dep_col_id: number, type: string) => {
  return get_deposit_col_id_(dep_col_id, type, settings.BURL);
}

const get_deposit_col_id_: any = async (dep_col_id: number, type: string, url: string) => {
  if (!settings.token) {
    settings.token = await get_token();
  }
  const token = settings.token;
  const headers = {
    'x-butterfly-session-token': token!,
  };
  const payload = {
    'proto': '/butterfly/backie/collection',
    'parentRefPath': '/lib/default/data/' + dep_col_id.toString(),
    'searchField.title.el': type,
  };
  return await fetchJson(url + '/search', {
    method: 'POST',
    headers, 
    body: new URLSearchParams(payload),
  })
  .then(response => {
    return response['results'][0]['id'] as unknown as number;
  });
}

const get_licenses: any = async () => {
  return get_licenses_(settings.BURL);
}

const get_licenses_: any = async (url: string) => {
  if (!settings.token) {
    settings.token = await get_token();
  }
  const token = settings.token;
  const headers = {
    'x-butterfly-session-token': token!,
  };
  const payload = {
    'proto': '/butterfly/backie/term_license',
    'rootRefPath': '/lib/default/data/thes_license',
    'sortFields': 'term_el|ASC',
  };
  return await fetchJson(url + '/search', {
    method: 'POST',
    headers, 
    body: new URLSearchParams(payload),
  })
  .then(response => {
    return response['results']
  });
}

const get_license: any = async (license: string) => {
  return get_license_(license, settings.BURL);
}

const get_license_: any = async (license: string, url: string) => {
  if (!settings.token) {
    settings.token = await get_token();
  }
  const token = settings.token;
  const headers = {
    'x-butterfly-session-token': token!,
  };
  const payload = {
    'proto': '/butterfly/backie/term_license',
    'rootRefPath': '/lib/default/data/thes_license',
    'sortFields': 'term_el|ASC',
    'searchField.term_el': license,
  };
  return await fetchJson(url + '/search', {
    method: 'POST',
    headers, 
    body: new URLSearchParams(payload),
  })
  .then(response => { console.log(response);
    return response['results'][0]['id'] as unknown as number;
  })
  .catch(err => {console.error(err); return null;});
}

const deposit_metadata: any = async (
  col_id: number,
  col_type: string,
  title_el: string,
  title_en: string,
  abstract_el: string,
  abstract_en: string,
  person_id: number,
  professor_id: number,
  deposit_date: string,
  language_id: number,
  keywords_el: string,
  keywords_en: string,
  description_el: string,
  description_en: string,
  license_id: number,
) => {
  return deposit_metadata_(
    col_id,
    col_type,
    title_el,
    title_en,
    abstract_el,
    abstract_en,
    person_id,
    professor_id,
    deposit_date,
    language_id,
    keywords_el,
    keywords_en,
    description_el,
    description_en,
    license_id,
    '',
    '',
    settings.BURL
    );
}

const deposit_metadata_: any = async (
  col_id: number,
  col_type: string,
  title_el: string,
  title_en: string,
  abstract_el: string,
  abstract_en: string,
  person_id: number,
  professor_id: number,
  deposit_date: string,
  language_id: number,
  keywords_el: string,
  keywords_en: string,
  description_el: string,
  description_en: string,
  license_id: number,
  notes_el: string,
  notes_en: string, 
  url: string,
) => {
  if (!settings.token) {
    settings.token = await get_token();
  }
  const token = settings.token;
  const headers = {
    'x-butterfly-session-token': token!,
  };
  const payload = {
    's': '/lib/default/data',
    'p': '/butterfly/backie/' + col_type,
    'parentRefPath': '/lib/default/data/' + col_id.toString(),
    'creator': '/lib/default/data/' + person_id.toString(),
    'professors': '/lib/default/data/' + professor_id.toString(),
    'isRoot': 'false',
    'title': title_el,
    'translatedTitle.el': title_el,
    'translatedTitle.en': title_en,
    'abstract.el': abstract_el,
    'abstract.en': abstract_en,
    'depositDateKind': 'date',
    'depositDateFrom': deposit_date,
    'language': '/lib/default/data/' + language_id.toString(),
    'keywords.el': keywords_el,
    'keywords.en': keywords_en,
    'description.el': description_el,
    'description.en': description_en,
    'notes.el': notes_el,
    'notes.en': notes_en,
    'license': '/lib/default/data/' + license_id.toString(),         
  };
  return await fetchJson(url + '/items', {
    method: 'POST',
    headers, 
    body: new URLSearchParams(payload),
  })
  .then(response => {
    return response['id'] as unknown as number
  });
}

async function getObjectContents(objectName: string) {

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

const upload_file: any = async (deposit_returned_id: number, instance: any) => {
  return upload_file_(deposit_returned_id, instance, settings.BURL);
}

const upload_file_: any = async (deposit_returned_id: number, instance: any, url: string) => {
  if (!settings.token) {
    settings.token = await get_token();
  }
  const token = settings.token;
  const objectName = instance.id + '/' + instance.new_filename;
  const fileContents: any = await getObjectContents(objectName)
  const filePath = '/home/aangelis/dev/nextjs/thesis/uploads/sample-1.pdf';
  const fileName = 'sample-1.pdf';
  // https://stackoverflow.com/questions/60620160/uploading-file-via-api-using-nodejs-fetch
  const form = new FormData();
  const buffer = fs.readFileSync(filePath);
  form.append('objectId', '/lib/default/data/' + deposit_returned_id as string);
  console.log("file contents ", fileContents)
  form.append('theFile', await fileContents[0], {
    contentType: 'application/pdf',
    filename: fileName,
  });
  const headers = {
    'x-butterfly-session-token': token!,
  };
  return await fetch(url + '/attachments/upload', {
    method: "POST",
    headers,
    body: form,
  })
  .then(handleErrors)
  .then(r => r.text())
  .then(r => {
    if (r.length === 0) {
      throw new Error('No server response data.')
    }
    return r;
  })
  .then(r => {return tryParseJSONObject(r)})
  .then(response => { console.log(response)
    return response.message === 'OK';
  });
}

const deposit: any = async (gauser: any, instance: any) => {
  return deposit_(gauser, instance, settings.BURL);
}

const deposit_: any = async (gauser: any, instance: any, url: string) => {
  const department = 'Τμήμα ' + instance.submitter_department;
  const root_col_id = get_root_path_id();
  const dep_col_id = get_department_id(department, root_col_id);
  interface ReturnData {
    type: string;
    col_type: string;
  }
  const returnData = (
    titleToFind: string,
    arrayToSearch: string[],
    fieldsArray: ReturnData[]
  ) => {
    return fieldsArray[arrayToSearch.indexOf(titleToFind)];
  }
  const {type, col_type} =
    returnData(
      instance.submitter_title,
      [
        'Προπτυχιακός Φοιτητής',
        'Μεταπτυχιακός Φοιτητής',
        'Υποψήφιος Διδάκτωρ',
      ],
      [
        {type: 'Πτυχιακές Εργασίες', col_type: 'graduate_thesis'},
        {type: 'Μεταπτυχιακές Εργασίες', col_type: 'postgraduate_thesis'},
        {type: 'Διδακτορικές Διατριβές', col_type: 'thesis'},
      ]
    );
  const deposit_col_id = get_deposit_col_id(dep_col_id, type)
  const person_id_temp = get_person(gauser.name_el + ', ' + gauser.surname_el)
  const person_id = person_id_temp?
    person_id_temp
    :
    add_person(gauser.surname_el + ', ' + gauser.name_el+ ', ' + gauser.father_name_el, gauser.surname_en + ', ' + gauser.name_en + ', ' + gauser.father_name_en); 
  const professor_id_temp = get_person(instance.supervisor)
  const professor_id = professor_id_temp?
    professor_id_temp
    :
    add_person(instance.supervisor, instance.supervisor);
  const keywords_el = instance.keywords_el;
  const keywords_en = instance.keywords_en;

  const description_el: string[] = [];
  const description_en: string[] = [];
  if (instance.pages) {
    description_el.push(instance.pages.toString() + ' σ.');
    description_en.push(instance.pages.toString() + ' p.');
  }
  if (instance.images) {
    description_el.push('εικ.');
    description_en.push('img.');
  }
  if (instance.tables) {
    description_el.push('πίν.');
    description_en.push('tabl.');
  }
  if (instance.diagrams) {
    description_el.push('διαγρ.');
    description_en.push('diag.');
  }
  if (instance.maps) {
    description_el.push('χάρτες');
    description_en.push('maps');
  }
  if (instance.drawings) {
    description_el.push('σχ.');
    description_en.push('draw.');
  }
  const description_el_str = description_el.join(', ');
  const description_en_str = description_en.join(', ');
  const language_id = get_language(instance.language);

  const license_id = get_license(instance.license)

  const d = new Date();
  const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
  const mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(d);
  const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
  const deposit_date = (`${ye}-${mo}-${da}`);

  const deposit_returned_id = deposit_metadata(
    deposit_col_id,
    col_type,
    instance.title_el,
    instance.title_en,
    instance.abstract_el,
    instance.abstract_en,
    person_id,
    professor_id,
    deposit_date,
    language_id,
    keywords_el,
    keywords_en,
    description_el_str,
    description_en_str,
    license_id,
    );

  const uploaded_file = upload_file(deposit_returned_id, instance);

  return {id: deposit_returned_id, uploaded_file};
  
}
