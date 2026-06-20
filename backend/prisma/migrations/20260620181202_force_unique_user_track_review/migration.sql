/*
  Warnings:

  - A unique constraint covering the columns `[userId,spotifyTrackId]` on the table `Post` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Post_userId_idx" ON "Post"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Post_userId_spotifyTrackId_key" ON "Post"("userId", "spotifyTrackId");
