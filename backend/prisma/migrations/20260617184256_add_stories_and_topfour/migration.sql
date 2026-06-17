-- CreateTable
CREATE TABLE "DailyStory" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "spotifyTrackId" TEXT NOT NULL,
    "trackName" TEXT NOT NULL,
    "artistName" TEXT NOT NULL,
    "albumCover" TEXT NOT NULL,
    "previewUrl" TEXT,
    "caption" TEXT NOT NULL,
    "genreTag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyStory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopFour" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "spotifyTrackId" TEXT NOT NULL,
    "trackName" TEXT NOT NULL,
    "artistName" TEXT NOT NULL,
    "albumCover" TEXT NOT NULL,

    CONSTRAINT "TopFour_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyStory_userId_idx" ON "DailyStory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TopFour_userId_position_key" ON "TopFour"("userId", "position");

-- AddForeignKey
ALTER TABLE "DailyStory" ADD CONSTRAINT "DailyStory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopFour" ADD CONSTRAINT "TopFour_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
