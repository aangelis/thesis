import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.update({
    where: {
      email: 'itp21101@hua.gr',
    },
    data: {
      //email: 'itp21101@hua.gr',
      //username: 'itp21101',
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
