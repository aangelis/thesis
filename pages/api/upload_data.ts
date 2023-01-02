import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from '@prisma/client'
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import permission from "./permission";

export default withIronSessionApiRoute(handler, sessionOptions);

const prisma = new PrismaClient()

const settings = {
  username: process.env.MDS_username || "",
  password: process.env.MDS_password || "",
  BURL: process.env.MDS_endpoint || "",
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    // Handle any other HTTP methods
    res.status(400).json({ message: "Bad HTTP method." });
    return;
  }

  interface Data {
    user_id: number;
    deposit_id: number;
  };

  const data: Data = await req.body;

  // TODO: validate db and input data
  // 

  const dbStoredUserData =
    (await prisma.user.findUnique({
      where: {
        id: data.user_id,
      }
    }))

  const dbStoredDepositData =
    (await prisma.deposit.findUnique({
      where: {
        id: data.deposit_id,
      }
    }))

  deposit(dbStoredUserData, dbStoredDepositData);

  // res.json({ message: "All good." });
  return;

}

const get_token : any = async () => {
  return await get_token_(settings.username, settings.password, settings.BURL)
}

const get_token_ : any = async (username: string, password: string, url: string) => {
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  const payload = { username, password, };
  return await fetch(url + '/authenticate', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  .then(response => response.json())
  .then(response => {
    return response.token
  })
  .catch(err => {console.error(err); return null;});
}

const get_person: any = async (person_el: any) => {
  return get_person_(person_el, settings.BURL);
}

const get_person_ : any = async (person_el: any, url: string) => {
  var token = get_token();
  const headers = {
    'x-butterfly-session-token': token,
  };
  const payload = {
    'proto': '/butterfly/backie/term_person',
    'text': person_el,
    'count': 1,
  };
  return await fetch(url + '/authenticate', {
    method: 'POST',
    headers, 
    body: JSON.stringify(payload),
  })
  .then(response => response.json())
  .then(response => {
    return response['results'][0]['id'] as unknown as number;
  })
  .catch(err => {console.error(err); return null;});
}

const add_person : any = async (person_el: string, person_en: string) => {
  return add_person_(person_el, person_en, settings.BURL);
}

const add_person_ = async (person_el: string, person_en: string, url: string) => {
  const token = get_token();
  const headers = {
    'x-butterfly-session-token': token,
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
  return await fetch(url + '/items', {
      method: 'POST',
      headers, 
      body: JSON.stringify(payload),
  })
  .then(response => response.json())
  .then(response => {
    return (
      response['results'][0]['id']?
      response['results'][0]['id'] : response['id']
    ) as unknown as number;
  })
  .catch(err => {console.error(err); return null;});
}

const get_language: any = async (language: string) => {
  return get_language_(language, settings.BURL);
}

const get_language_: any = async (language: string, url: string) => {
  const token = get_token();
  const headers = {
    'x-butterfly-session-token': token,
  };
  const payload = {
    'proto': '/butterfly/backie/term',
    'text': language,
    'parentRefPath': '/lib/default/data/thes_language',
    'count': 1,
  };
  return await fetch(url + '/search', {
    method: 'POST',
    headers, 
    body: JSON.stringify(payload),
  })
  .then(response => response.json())
  .then(response => {
    return response['results'][0]['id'] as unknown as number;
  })
  .catch(err => {console.error(err); return null;});
}

const get_root_path_id: any = async () => {
  return get_root_path_id_(settings.BURL);
}

const get_root_path_id_: any = async (url: string) => {
  const token = get_token();
  const headers = {
    'x-butterfly-session-token': token,
  };
  const payload = {
    'proto': '/butterfly/backie/collection',
    'text': 'Γκρίζα Βιβλιογραφία Χαροκοπείου Πανεπιστημίου',
    'isRoot': 'true',
  };
  return await fetch(url + '/search', {
    method: 'POST',
    headers, 
    body: JSON.stringify(payload),
  })
  .then(response => response.json())
  .then(response => {
    return response['results'][0]['id'] as unknown as number;
  })
  .catch(err => {console.error(err); return null;});
}

const get_department_id: any = async (department: string, root_col_id: number) => {
  return get_department_id_(department, root_col_id, settings.BURL);
}

const get_department_id_: any = async (department: string, root_col_id: number, url: string) => {
  const token = get_token();
  const payloadDepartment =
    department.search('Διαιτολογίας') >= 0? 
     "Τμήμα Επιστήμης Διαιτολογίας-Διατροφής"
     : department.search('Οικονομίας') >= 0?
        "Τμήμα  Οικονομίας και Βιώσιμης Ανάπτυξης"
        : ""
  const headers = {
    'x-butterfly-session-token': token,
  };
  const payload = {
    'proto': '/butterfly/backie/collection',
    'parentRefPath': '/lib/default/data/' + root_col_id.toString(),
    'searchField.title.el': payloadDepartment,
  };
  return await fetch(url + '/search', {
    method: 'POST',
    headers, 
    body: JSON.stringify(payload),
  })
  .then(response => response.json())
  .then(response => {
    return response['results'][0]['id'] as unknown as number;
  })
  .catch(err => {console.error(err); return null;});
}

const get_deposit_col_id: any = async (dep_col_id: number, type: string) => {
  return get_deposit_col_id_(dep_col_id, type, settings.BURL);
}

const get_deposit_col_id_: any = async (dep_col_id: number, type: string, url: string) => {
  const token = get_token();
  const headers = {
    'x-butterfly-session-token': token,
  };
  const payload = {
    'proto': '/butterfly/backie/collection',
    'parentRefPath': '/lib/default/data/' + dep_col_id.toString(),
    'searchField.title.el': type,
  };
  return await fetch(url + '/search', {
    method: 'POST',
    headers, 
    body: JSON.stringify(payload),
  })
  .then(response => response.json())
  .then(response => {
    return response['results'][0]['id'] as unknown as number;
  })
  .catch(err => {console.error(err); return null;});
}

const get_licenses: any = async () => {
  return get_licenses_(settings.BURL);
}

const get_licenses_: any = async (url: string) => {
  const token = get_token();
  const headers = {
    'x-butterfly-session-token': token,
  };
  const payload = {
    'proto': '/butterfly/backie/term_license',
    'rootRefPath': '/lib/default/data/thes_license',
    'sortFields': 'term_el|ASC',
  };
  return await fetch(url + '/search', {
    method: 'POST',
    headers, 
    body: JSON.stringify(payload),
  })
  .then(response => response.json())
  .then(response => {
    return response['results']
  })
  .catch(err => {console.error(err); return null;});
}

const get_license: any = async (license: string) => {
  return get_license_(license, settings.BURL);
}

const get_license_: any = async (license: string, url: string) => {
  const token = get_token();
  const headers = {
    'x-butterfly-session-token': token,
  };
  const payload = {
    'proto': '/butterfly/backie/term_license',
    'rootRefPath': '/lib/default/data/thes_license',
    'sortFields': 'term_el|ASC',
    'searchField.term_el': license,
  };
  return await fetch(url + '/search', {
    method: 'POST',
    headers, 
    body: JSON.stringify(payload),
  })
  .then(response => response.json())
  .then(response => {
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
  const token = get_token();
  const headers = {
    'x-butterfly-session-token': token,
  };
  const payload = {
    's': '/lib/default/data',
    'p': '/butterfly/backie/'+col_type,
    'parentRefPath': '/lib/default/data/'+col_id.toString(),
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
  return await fetch(url + '/items', {
    method: 'POST',
    headers, 
    body: JSON.stringify(payload),
  })
  .then(response => response.json())
  .then(response => {
    return response['id'] as unknown as number
  })
  .catch(err => {console.error(err); return null;});
}

const upload_file: any = async (deposit_id: number, file: any, file_type: string) => {
  return upload_file_(deposit_id, file, file_type, settings.BURL);
}

const upload_file_: any = async (deposit_id: number, file: any, file_type: string, url: string) => {
  const token = get_token();
  // TODO: file upload
  const m = { content_type: "22" };
  const headers = {
    'x-butterfly-session-token': token,
    'Content-Type': m.content_type,
  };
  const payload = {
    'x-butterfly-session-token': token,
    'Content-Type': m.content_type,
  };
  return await fetch(url + '/attachments/upload', {
    method: 'POST',
    headers, 
    body: JSON.stringify(payload),
  })
  .then(response => response.json())
  .then(response => {
    return response['message'] === 'OK';
  })
  .catch(err => {console.error(err); return null;});
}

const deposit: any = async (gauser: any, instance: any) => {
  return deposit_(gauser, instance, settings.BURL);
}

const deposit_: any = async (gauser: any, instance: any, url: string) => {
  const department = 'Τμήμα ' + gauser.department;
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
      gauser.title,
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
  // const license_id = get_license(license);
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
  const keywords_el_str = keywords_el.all().join(', ');
  const keywords_en = instance.keywords_en;
  const keywords_en_str = keywords_en.join(', ');

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


  const the_file = {document: 'gg', file_type: 'gfgf'}
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
    keywords_el_str,
    keywords_en_str,
    description_el_str,
    description_en_str,
    license_id,
    );

  const uploaded_file = upload_file(deposit_returned_id, the_file.document.toString(), the_file.file_type);

  if (deposit_returned_id) {
    if (uploaded_file) {
      console.log('Η απόθεση ολοκληρώθηκε');
    } else {
      console.error('Η απόθεση ολοκληρώθηκε αλλά το αρχείο δεν ανέβηκε');
    }
  } else {
    console.error('Η απόθεση δεν πραγματοποιήθηκε');
  }
  
}




















