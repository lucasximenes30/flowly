-- CreateTable
CREATE TABLE "workout_days" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "weekDay" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_days_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workout_days_planId_order_idx" ON "workout_days"("planId", "order");

-- AddConstraint
ALTER TABLE "workout_days"
ADD CONSTRAINT "workout_days_weekDay_check"
CHECK ("weekDay" IS NULL OR ("weekDay" >= 0 AND "weekDay" <= 6));

-- AddForeignKey
ALTER TABLE "workout_days" ADD CONSTRAINT "workout_days_planId_fkey"
FOREIGN KEY ("planId") REFERENCES "workout_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
