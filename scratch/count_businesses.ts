import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const count = await prisma.user.count({
    where: {
      directoryOptIn: true
    }
  })
  console.log(`TOTAL_BUSINESSES_IN_DIRECTORY: ${count}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
