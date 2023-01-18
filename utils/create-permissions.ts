import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const permissions = 
[
  {
    // id: 2,
    submitter_email: 'itp21103@hua.gr',
    due_to: '2023-01-03T21:59:59.999Z',
    secretary_id: 3 // 7 -> 3  ΜΗΤΣΗ
  },
  {
    // id: 3,
    submitter_email: 'itp22107@hua.gr',
    due_to: '2023-02-24T00:00:00.000Z',
    secretary_id: 6 // 8 -> 6 ΔΑΝΕΛΗ
  },
  {
    // id: 4,
    submitter_email: 'itp2110122@hua.gr',
    due_to: '2022-01-10T22:00:00.000Z',
    secretary_id: 6
  },
  {
    // id: 5,
    submitter_email: 'itp21101@hua.gr',
    due_to: '2023-01-30T21:59:59.999Z',
    secretary_id: 6
  },
  {
    // id: 8,
    submitter_email: 'itp22044@hua.gr',
    due_to: '2022-12-31T21:59:59.999Z',
    secretary_id: 6
  },
  {
    // id: 14,
    submitter_email: '43434344666@hua.gr',
    due_to: '2023-01-04T21:59:59.999Z',
    secretary_id: 3
  }
]




async function main() {

  permissions.forEach(
    async x => {
    const permission = await prisma.permission.create({
      data: x
    })
    console.log(permission.submitter_email)
  })

}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
