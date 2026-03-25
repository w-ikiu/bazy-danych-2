-- CreateEnum
CREATE TYPE "Power" AS ENUM ('flight', 'strength', 'telepathy', 'speed', 'invisibility');

-- CreateEnum
CREATE TYPE "HeroStatus" AS ENUM ('available', 'busy', 'retired');

-- CreateEnum
CREATE TYPE "IncidentLevel" AS ENUM ('low', 'medium', 'critical');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('open', 'assigned', 'resolved');

-- CreateTable
CREATE TABLE "Hero" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "power" "Power" NOT NULL,
    "status" "HeroStatus" NOT NULL DEFAULT 'available',
    "missionsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(80) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" SERIAL NOT NULL,
    "location" TEXT NOT NULL,
    "district" TEXT,
    "level" "IncidentLevel" NOT NULL,
    "status" "IncidentStatus" NOT NULL DEFAULT 'open',
    "heroId" INTEGER,
    "assignedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentCategory" (
    "incidentId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "IncidentCategory_pkey" PRIMARY KEY ("incidentId","categoryId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Hero_name_key" ON "Hero"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentCategory" ADD CONSTRAINT "IncidentCategory_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentCategory" ADD CONSTRAINT "IncidentCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
