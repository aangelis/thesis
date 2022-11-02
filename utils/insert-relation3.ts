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
          title: 'RFSS7 verification process',
          title_el: 'διαδικασία επαλήθευσης RFSS7',
          title_en: 'RFSS7 verification process',
          pages: 12,
          // tables: 0,
          // maps: 0,
          drawings: 5,
          images: 23,
          diagrams: 2,
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
