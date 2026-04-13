import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const exercises = await prisma.exercise.findMany({
    select: { id: true, namePt: true, nameEn: true, muscleGroup: true, equipment: true, isSystem: true, source: true }
  })
  console.log(`Found ${exercises.length} total exercises.`)
  console.log("Samples:", exercises.slice(0, 5))
}

main().catch(console.error).finally(() => prisma.$disconnect())
