const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Starting migration...')
  
  // Migrate ADMIN role to ADMIN plan
  const adminUpdate = await prisma.user.updateMany({
    where: { role: 'ADMIN' },
    data: { plan: 'ADMIN' }
  })
  console.log(`Updated ${adminUpdate.count} ADMIN users to ADMIN plan.`)
  
  // Migrate COURTESY role to COURTESY plan
  const courtesyUpdate = await prisma.user.updateMany({
    where: { role: 'COURTESY' },
    data: { plan: 'COURTESY' }
  })
  console.log(`Updated ${courtesyUpdate.count} COURTESY users to COURTESY plan.`)

  console.log('Migration complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
