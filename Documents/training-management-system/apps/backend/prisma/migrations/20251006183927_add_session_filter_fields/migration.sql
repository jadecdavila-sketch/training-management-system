-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "facilitatorSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "groupSizeMax" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "groupSizeMin" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "locationTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "participantTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "requiresFacilitator" BOOLEAN NOT NULL DEFAULT true;
