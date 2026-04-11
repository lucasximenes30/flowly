-- CreateEnum
CREATE TYPE "ExerciseMuscleGroup" AS ENUM (
    'CHEST',
    'BACK',
    'LEGS',
    'SHOULDERS',
    'BICEPS',
    'TRICEPS',
    'ABS',
    'GLUTES',
    'CARDIO',
    'FULL_BODY',
    'OTHER'
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL,
    "namePt" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "muscleGroup" "ExerciseMuscleGroup" NOT NULL,
    "equipment" TEXT,
    "imageUrl" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_day_exercises" (
    "id" TEXT NOT NULL,
    "workoutDayId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" TEXT NOT NULL,
    "targetWeight" DECIMAL(8,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_day_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exercises_isSystem_muscleGroup_idx" ON "exercises"("isSystem", "muscleGroup");

-- CreateIndex
CREATE INDEX "exercises_userId_createdAt_idx" ON "exercises"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "workout_day_exercises_workoutDayId_order_idx" ON "workout_day_exercises"("workoutDayId", "order");

-- CreateIndex
CREATE INDEX "workout_day_exercises_exerciseId_idx" ON "workout_day_exercises"("exerciseId");

-- AddConstraint
ALTER TABLE "workout_day_exercises"
ADD CONSTRAINT "workout_day_exercises_order_check"
CHECK ("order" >= 0);

-- AddConstraint
ALTER TABLE "workout_day_exercises"
ADD CONSTRAINT "workout_day_exercises_sets_check"
CHECK ("sets" > 0);

-- AddConstraint
ALTER TABLE "workout_day_exercises"
ADD CONSTRAINT "workout_day_exercises_targetWeight_check"
CHECK ("targetWeight" IS NULL OR "targetWeight" >= 0);

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_day_exercises" ADD CONSTRAINT "workout_day_exercises_workoutDayId_fkey"
FOREIGN KEY ("workoutDayId") REFERENCES "workout_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_day_exercises" ADD CONSTRAINT "workout_day_exercises_exerciseId_fkey"
FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
