import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.update({
    where: {
      email: "john-smith@prisma.io",
    },
    data: {
      email: "john-smith@prisma.io",
      username: "jsmith",
      first_name: "John",
      last_name: "Myth",
      name_el: null,
      name_en: null,
      surname_el: null,
      surname_en: null,
      father_name_el: null,
      father_name_en: null,
      department: null,
      title: null,
      title_ldap: null,
      is_staff: false,
      is_active: true,
      is_superuser: false,
      last_login: null,
      date_joined: "2022-10-17T18:34:10.969Z"
    },
  })
  console.log(user)
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
