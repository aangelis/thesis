import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const deposit = await prisma.deposit.update({
    where: {
      id: 4,
    },
    data: {
      new_filename: null,
      original_filename: null
    },
  })
  console.log(deposit)
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
