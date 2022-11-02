import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.update({
    where: {
      email: 'itp21100@hua.gr',
    },
    data: {
      //email: 'itp21100@hua.gr',
      //username: 'itp21100',
      deposits: {
        create: {
          title: 'CSNFR verification process',
          title_el: 'διαδικασία επαλήθευσης CSNFRC',
          title_en: 'SNFR verification process',
          pages: 86,
          tables: 1,
          maps: 21
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
