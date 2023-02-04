import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from '@prisma/client'
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { User } from "pages/api/user";

export default withIronSessionApiRoute(handler, sessionOptions);

const prisma = new PrismaClient()

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
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
    // find submitter id, email, first and last name
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
    return x;
  })

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