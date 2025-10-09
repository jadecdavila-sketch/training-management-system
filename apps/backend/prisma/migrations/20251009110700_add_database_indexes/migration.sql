-- CreateIndex
CREATE INDEX "cohorts_programId_idx" ON "cohorts"("programId");

-- CreateIndex
CREATE INDEX "cohorts_startDate_idx" ON "cohorts"("startDate");

-- CreateIndex
CREATE INDEX "cohorts_status_idx" ON "cohorts"("status");

-- CreateIndex
CREATE INDEX "cohorts_programId_startDate_idx" ON "cohorts"("programId", "startDate");

-- CreateIndex
CREATE INDEX "participants_hireDate_idx" ON "participants"("hireDate");

-- CreateIndex
CREATE INDEX "participants_location_idx" ON "participants"("location");

-- CreateIndex
CREATE INDEX "participants_department_idx" ON "participants"("department");

-- CreateIndex
CREATE INDEX "participants_status_idx" ON "participants"("status");

-- CreateIndex
CREATE INDEX "participants_location_hireDate_idx" ON "participants"("location", "hireDate");

-- CreateIndex
CREATE INDEX "participants_department_hireDate_idx" ON "participants"("department", "hireDate");

-- CreateIndex
CREATE INDEX "programs_archived_idx" ON "programs"("archived");

-- CreateIndex
CREATE INDEX "programs_createdAt_idx" ON "programs"("createdAt");

-- CreateIndex
CREATE INDEX "schedules_cohortId_idx" ON "schedules"("cohortId");

-- CreateIndex
CREATE INDEX "schedules_sessionId_idx" ON "schedules"("sessionId");

-- CreateIndex
CREATE INDEX "schedules_facilitatorId_idx" ON "schedules"("facilitatorId");

-- CreateIndex
CREATE INDEX "schedules_locationId_idx" ON "schedules"("locationId");

-- CreateIndex
CREATE INDEX "schedules_startTime_idx" ON "schedules"("startTime");

-- CreateIndex
CREATE INDEX "schedules_status_idx" ON "schedules"("status");

-- CreateIndex
CREATE INDEX "schedules_cohortId_startTime_idx" ON "schedules"("cohortId", "startTime");

-- CreateIndex
CREATE INDEX "schedules_facilitatorId_startTime_idx" ON "schedules"("facilitatorId", "startTime");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");
