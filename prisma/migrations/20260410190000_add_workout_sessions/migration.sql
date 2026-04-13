-- CreateTable
CREATE TABLE "workout_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "workoutDayId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "dayNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_session_exercises" (
    "id" TEXT NOT NULL,
    "workoutSessionId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "setsDone" INTEGER,
    "repsDone" TEXT,
    "weightUsed" DECIMAL(8,2),
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_session_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workout_sessions_userId_date_idx" ON "workout_sessions"("userId", "date");

-- CreateIndex
CREATE INDEX "workout_sessions_planId_idx" ON "workout_sessions"("planId");

-- CreateIndex
CREATE INDEX "workout_sessions_workoutDayId_idx" ON "workout_sessions"("workoutDayId");

-- CreateIndex
CREATE INDEX "workout_session_exercises_workoutSessionId_idx" ON "workout_session_exercises"("workoutSessionId");

-- CreateIndex
CREATE INDEX "workout_session_exercises_exerciseId_idx" ON "workout_session_exercises"("exerciseId");

-- AddConstraint
ALTER TABLE "workout_session_exercises"
ADD CONSTRAINT "workout_session_exercises_setsDone_check"
CHECK ("setsDone" IS NULL OR "setsDone" > 0);

-- AddConstraint
ALTER TABLE "workout_session_exercises"
ADD CONSTRAINT "workout_session_exercises_weightUsed_check"
CHECK ("weightUsed" IS NULL OR "weightUsed" >= 0);

-- AddForeignKey
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_planId_fkey"
FOREIGN KEY ("planId") REFERENCES "workout_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_workoutDayId_fkey"
FOREIGN KEY ("workoutDayId") REFERENCES "workout_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_session_exercises" ADD CONSTRAINT "workout_session_exercises_workoutSessionId_fkey"
FOREIGN KEY ("workoutSessionId") REFERENCES "workout_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_session_exercises" ADD CONSTRAINT "workout_session_exercises_exerciseId_fkey"
FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
