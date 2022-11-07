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
          title: 'FGRFSS7 verification process',
          title_el: 'διαδικασία επαλήθευσης FGRFSS7',
          title_en: 'FGRFSS7 verification process',
          pages: 12,
          tables: 3,
          maps: 2,
          drawings: 11,
          images: 9,
          diagrams: 1,
	  supervisor: 'Ανάργυρος Τσαδήμας'
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
