import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const permissions = await prisma.permission.findMany()
  console.log(permissions)
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
