import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const roles = 
[
  {
    id: 4,
    email: 'itp220022@hua.gr',
    is_admin: true,
    is_secretary: false,
    is_librarian: false,
    is_active: false
  },
  {
    id: 5,
    email: 'itp22200@hua.gr',
    is_admin: false,
    is_secretary: true,
    is_librarian: false,
    is_active: false
  },
  {
    id: 6,
    email: 'itp21101@hua.gr',
    is_admin: false,
    is_secretary: true,
    is_librarian: false,
    is_active: false
  },
  {
    id: 7,
    email: 'ifigenia@hua.gr',
    is_admin: false,
    is_secretary: false,
    is_librarian: true,
    is_active: true
  },
  {
    id: 8,
    email: 'mitsi@hua.gr',
    is_admin: false,
    is_secretary: true,
    is_librarian: false,
    is_active: true
  },
  {
    id: 9,
    email: 'daneli@hua.gr',
    is_admin: false,
    is_secretary: true,
    is_librarian: false,
    is_active: true
  }
]

async function main() {

  roles.forEach(
    async x => {
    const role = await prisma.role.create({
      data: x
    })
    console.log(role.email)
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
