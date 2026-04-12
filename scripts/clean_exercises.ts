import { PrismaClient } from '@prisma/client'
import { SYSTEM_EXERCISES } from '../lib/exerciseCatalog'
import { normalizeName, standardizeEquipment } from '../lib/exerciseUtils'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting BATCHED data cleanup for Exercises...')

  const allInitialExercises = await prisma.exercise.findMany({ select: { id: true, namePt: true, nameEn: true, source: true, isSystem: true, equipment: true, muscleGroup: true } })
  console.log(`Loaded ${allInitialExercises.length} records.`)

  const existingSystemMap = new Map() 
  for (const ex of allInitialExercises) {
    if (ex.source === 'SYSTEM') existingSystemMap.set(normalizeName(ex.namePt), ex)
  }

  const goldStandardMap = new Map<string, string>() 
  const goldStandarIds = new Set<string>()

  // Batch insert/updates for gold standards
  let creates = []
  let updates = []

  for (const template of SYSTEM_EXERCISES) {
    const normPt = normalizeName(template.namePt)
    const normEn = normalizeName(template.nameEn)
    const equipment = standardizeEquipment(template.equipment)

    let exDoc = existingSystemMap.get(normPt)
    if (!exDoc) {
      creates.push({ namePt: template.namePt, nameEn: template.nameEn, muscleGroup: template.muscleGroup, equipment, isSystem: true, source: 'SYSTEM' as const })
    } else {
      if (exDoc.nameEn !== template.nameEn || exDoc.equipment !== equipment || exDoc.muscleGroup !== template.muscleGroup) {
        updates.push(prisma.exercise.update({ where: { id: exDoc.id }, data: { nameEn: template.nameEn, equipment, muscleGroup: template.muscleGroup } }))
      }
      goldStandardMap.set(normPt, exDoc.id)
      goldStandardMap.set(normEn, exDoc.id)
      goldStandarIds.add(exDoc.id)
    }
  }

  if (creates.length > 0) {
    console.log(`Creating ${creates.length} new gold standards...`)
    await prisma.exercise.createMany({ data: creates, skipDuplicates: true })
    
    // fetch them to map ids
    const newlyCreated = await prisma.exercise.findMany({ where: { namePt: { in: creates.map(c => c.namePt) } } })
    for (const nc of newlyCreated) {
       goldStandardMap.set(normalizeName(nc.namePt), nc.id)
       goldStandardMap.set(normalizeName(nc.nameEn), nc.id)
       goldStandarIds.add(nc.id)
    }
  }

  if (updates.length > 0) {
    console.log(`Updating ${updates.length} gold standards...`)
    // chunk 50 at a time
    for (let i = 0; i < updates.length; i += 50) {
       await Promise.all(updates.slice(i, i + 50))
    }
  }

  const remainingExercises = allInitialExercises.filter(ex => !goldStandarIds.has(ex.id))
  
  // Aggregate by matchId
  const toDeleteToMatch = new Map<string, string[]>() 
  const toDeleteWithoutMatch: string[] = []
  
  for (const ex of remainingExercises) {
    const normPt = normalizeName(ex.namePt)
    const normEn = normalizeName(ex.nameEn)
    let matchId = goldStandardMap.get(normPt) || goldStandardMap.get(normEn)
    
    if (matchId && ex.id !== matchId) {
       if (!toDeleteToMatch.has(matchId)) toDeleteToMatch.set(matchId, [])
       toDeleteToMatch.get(matchId)!.push(ex.id)
    } else {
       if (ex.source === 'WGER' || ex.source === 'SYSTEM') {
         toDeleteWithoutMatch.push(ex.id)
       }
    }
  }

  console.log(`Reassigning duplicates to ${toDeleteToMatch.size} standards...`)

  let idsToDelete: string[] = []
  for (const [matchId, ids] of toDeleteToMatch.entries()) {
    idsToDelete.push(...ids)
    await prisma.workoutDayExercise.updateMany({ where: { exerciseId: { in: ids } }, data: { exerciseId: matchId } })
    await prisma.workoutSessionExercise.updateMany({ where: { exerciseId: { in: ids } }, data: { exerciseId: matchId } })
    await prisma.workoutExerciseLog.updateMany({ where: { exerciseId: { in: ids } }, data: { exerciseId: matchId } })
  }
  
  if (idsToDelete.length > 0) {
     const delRes = await prisma.exercise.deleteMany({ where: { id: { in: idsToDelete } } })
     console.log(`Deleted ${delRes.count} mapped duplicate exercises.`)
  }

  // Delete unused unmapped SYSTEM/WGER
  let deletedUnusedCount = 0;
  console.log(`Checking usage for ${toDeleteWithoutMatch.length} unmapped system/wger exercises...`)
  const batchSize = 100;
  for (let i = 0; i < toDeleteWithoutMatch.length; i += batchSize) {
    const batchIds = toDeleteWithoutMatch.slice(i, i + batchSize)
    
    const usedInDay = await prisma.workoutDayExercise.findMany({ where: { exerciseId: { in: batchIds } }, select: { exerciseId: true } })
    const usedInSess = await prisma.workoutSessionExercise.findMany({ where: { exerciseId: { in: batchIds } }, select: { exerciseId: true } })
    
    const usedIds = new Set([...usedInDay.map(x => x.exerciseId), ...usedInSess.map(x => x.exerciseId)])
    const safeToDelete = batchIds.filter(id => !usedIds.has(id))
    
    if(safeToDelete.length > 0) {
      const delUnused = await prisma.exercise.deleteMany({ where: { id: { in: safeToDelete } } })
      deletedUnusedCount += delUnused.count
    }
  }

  console.log(`MIGRATION COMPLETE! Deleted Unmapped Unused: ${deletedUnusedCount}.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
