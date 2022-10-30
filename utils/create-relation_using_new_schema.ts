import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.create({
    data: {
      email: 'john-smith@prisma.io',
      username: 'jsmith',
      first_name: 'John',
      last_name: 'Smith',
      deposits: {
        create: {
          title: 'NFR verification process',
          title_el: 'NFR verification process',
          title_en: 'διαδικασία επαλήθευσης NFR',
          pages: 12,
          tables: 3,
          maps: 0
        },
      },
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
