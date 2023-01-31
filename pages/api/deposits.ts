import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from '@prisma/client'
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { User } from "pages/api/user";

export default withIronSessionApiRoute(handler, sessionOptions);

const prisma = new PrismaClient()

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    // Handle any other HTTP methods
    res.status(400).json({ message: "Bad HTTP method." });
    return;
  }
  const user: User = req.session.user!;

  // Process a GET request
  const data = req.query; // paging data
  const page = parseInt(data.page as string);
  const limit = parseInt(data.limit as string);

  if (isNaN(+page!) || isNaN(+limit!)) {
    res.status(400).json({ message: "Invalid input data." });
    return;
  }

  if (page<=0 || limit<=0) {
    res.status(400).json({ message: "Invalid input data." });
    return;
  }

  const sortBy = data.sortby as string || 'id';
  const sortOrder = data.sortorder as string || 'asc';
  const filterColumnField = data.filtercolumnfield as string;
  const filterOperatorValue = data.filteroperatorvalue as string;
  const filterValue = data.filtervalue as string;

  const orderByObj = (!!sortBy && !!sortOrder) ?
    (sortBy === 'submitter_fullname' ?
    [ { submitter: { surname_el: sortOrder, } }, { submitter: { name_el: sortOrder, } }, ] : 
    (sortBy === 'submitter_fullname_ldap' ?
    [ { submitter: { last_name: sortOrder, } }, { submitter: { first_name: sortOrder, } }, ] :
    (sortBy === 'submitter.email' ?
    [ { submitter: { email: sortOrder, } }, ]
    : [ { [sortBy]: sortOrder, } ])))
    : []

  const numberFields = [ 'id', 'pages', 'images', 'tables', 'diagrams', 'maps', 'drawings', 'submitter_id', ]

  const filterValueObj = {
    [filterOperatorValue]: numberFields.indexOf(filterColumnField)>=0 ? 
      parseInt(filterValue) : 
      filterColumnField === 'confirmed' ? filterValue === 'true' : filterValue
  }
    
  const filterObjArray = (!!filterColumnField && !!filterOperatorValue && !!filterValue) ?
    (filterColumnField === 'submitter_fullname' ?
    [ { submitter: { surname_el: filterValueObj, } }, { submitter: { name_el: filterValueObj, } }, ] : 
    (filterColumnField === 'submitter_fullname_ldap' ?
    [ { submitter: { last_name: filterValueObj, } }, { submitter: { first_name: filterValueObj, } }, ] :
    (filterColumnField === 'submitter.email' ?
    [ { submitter: { email: filterValueObj, } }, ]
    : [ { [filterColumnField]: filterValueObj, } ] )))
    : [ {} ]

  const filterObj = filterObjArray[1] ?
    { OR: [ ...filterObjArray ] } :
    filterObjArray[0] ?
    filterObjArray[0] :
    {}
    
  interface Deposit {
    id: number;
    title: string;
    title_el: string;
    title_en: string;
    content: string | null;
    abstract_el: string | null;
    abstract_en: string | null;
    pages: number;
    language: string | null;
    images: number;
    tables: number;
    diagrams: number;
    maps: number;
    drawings: number;	
    confirmed: boolean;
    confirmed_timestamp: Date | null;
    license: string | null;
    comments: string | null;
    submitter_id: number;
    supervisor: string | null;
    new_filename: string | null;
    original_filename: string | null;
    submitter?: {
      id: number;
      email: string;
      first_name: string | null;
      last_name: string | null;
      name_el: string | null;
      surname_el: string | null;
      department: string | null;
      title: string | null;
    }
    submitter_fullname?: string | null;
    submitter_fullname_ldap?: string | null;
    // submitter_department?: string | null;
    // submitter_title?: string | null;
  }

  // in case of secretary find assigned users
  const assignedUsers = user.isSecretary?
  (await prisma.permission.findMany({
    where: {
      secretary_id: user!.id!
    },
    select: {
      submitter_email: true,
    }
  }))
  :
  []

  const emails: string[] = [];
  assignedUsers.forEach(({submitter_email: v}) => emails.push(v))

  const dbData = user.is_superuser?
  ((user.isSecretary && !user.isAdmin)?
    // in case of secretary show only deposits of assigned users
    // find find submitter id, email, first and last name
    (await prisma.$transaction([
      prisma.deposit.count({
        where: {
          submitter: {
            email: { in: emails },
          },
          ...filterObj,
        }
      }),
      prisma.deposit.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        ...orderByObj as any,
      ],
      include: {
        submitter: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            name_el: true,
            surname_el: true,
            department: true,
            title: true,
          }
        }
      },
      where: {
        submitter: {
          email: { in: emails },
        },
        ...filterObj,
      }
    })]))
    :
    // in case of superuser find submitter first and last name
    (await prisma.$transaction([
      prisma.deposit.count({
        where: {
          ...filterObj,
        },
      }),
      prisma.deposit.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        ...orderByObj as any,
      ],
      where: {
        ...filterObj,
      },
      include: {
        submitter: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            name_el: true,
            surname_el: true,
            department: true,
            title: true,
          }
        }
      }
    })]))
  )
  :
  // submitter user
  (await prisma.$transaction([
    prisma.deposit.count({
      where: {
        submitter_id: user.id || undefined,
        ...filterObj,
      },
    }),
    prisma.deposit.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: [
      ...orderByObj as any,
    ],
    where: {
      submitter_id: user.id || undefined,
      ...filterObj,
    },
    include: {
      submitter: {
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          name_el: true,
          surname_el: true,
          department: true,
          title: true,
        }
      }
    }
  })]))

  const deposits: any = dbData[1];

  deposits.map((x: any) => {
    x.submitter_fullname =
      (!!(x.submitter?.surname_el)? x.submitter?.surname_el : "(κενό επίθετο)")
      + ' '
      + ((x.submitter?.name_el)? x.submitter?.name_el : "(κενό όνομα)");
    x.submitter_fullname_ldap = x.submitter?.last_name + ' ' + x.submitter?.first_name;
    // x.submitter_department = x.submitter?.department;
    // x.submitter_title = x.submitter?.title;
    return x;
  })

  /*

  const unconfirmedCount = !user.is_superuser?
    ((await prisma.deposit.aggregate({
      where: {
        submitter_id: user.id!,
        confirmed: false,
      },
      _count: {
        confirmed: true,
      },
    }))._count.confirmed || 0)
    : 0

  const addNewCount = !user.is_superuser?
    ((await prisma.permission.aggregate({
      where: {
        submitter_email: user.email!,
        due_to: {
          gte: new Date(),
          // gte: new Date('2022-12-26'),
        },
      },
      _count: {
        _all: true
      }
    }))._count._all || 0)
    : 0

    const canAddNewDeposit = !user?.is_superuser && unconfirmedCount < addNewCount;

    const depositMeta = {
      unconfirmedCount,
      addNewCount,
      canAddNewDeposit
    }
/*

/*

  const dbData = await prisma.$transaction([
    prisma.deposit.count({
      where: {
        submitter_id: user.id || undefined,
      },
    }),
    prisma.deposit.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        orderByObj
      ],
      include: {
        submitter: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            name_el: true,
            surname_el: true,
            department: true,
            title: true,
          }
        }
      },
      where: {
        submitter_id: user.id || undefined,
      },
    })
  ])

  const deposits = dbData[1];
  const total = dbData[0];

  */

  const total = dbData[0];

  res.json({
    filterColumnField,
    filterOperatorValue,
    filterValue,
    skip: (page - 1) * limit,
    take: limit, 
    total, 
    data: deposits});

}