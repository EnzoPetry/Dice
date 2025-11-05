-- AlterTable
ALTER TABLE "public"."group" ADD COLUMN     "requiresApproval" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."join_request" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "groupId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "join_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "join_request_userId_groupId_key" ON "public"."join_request"("userId", "groupId");

-- AddForeignKey
ALTER TABLE "public"."join_request" ADD CONSTRAINT "join_request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."join_request" ADD CONSTRAINT "join_request_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
