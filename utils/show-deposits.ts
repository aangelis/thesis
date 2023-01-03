import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const deposits = await prisma.deposit.findMany()
  console.log(deposits)
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
