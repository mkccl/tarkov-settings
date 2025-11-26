-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "twitchUsername" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SettingsProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "gpuBrand" TEXT NOT NULL,
    "nvidiaBrightness" INTEGER,
    "nvidiaContrast" INTEGER,
    "nvidiaGamma" DOUBLE PRECISION,
    "nvidiaDigitalVibrance" INTEGER,
    "nvidiaHue" INTEGER,
    "amdColorTempControl" BOOLEAN,
    "amdBrightness" INTEGER,
    "amdHue" INTEGER,
    "amdContrast" INTEGER,
    "amdSaturation" INTEGER,
    "amdDisplayColorEnhancement" TEXT,
    "amdDynamicContrastValue" INTEGER,
    "gameSettings" JSONB NOT NULL,
    "soundSettings" JSONB NOT NULL,
    "postFxSettings" JSONB NOT NULL,
    "graphicsSettings" JSONB NOT NULL,
    "controlSettings" JSONB NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SettingsProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "settingsProfileId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Star" (
    "id" TEXT NOT NULL,
    "settingsProfileId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Star_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_twitchUsername_key" ON "User"("twitchUsername");

-- CreateIndex
CREATE INDEX "User_clerkId_idx" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "User_twitchUsername_idx" ON "User"("twitchUsername");

-- CreateIndex
CREATE INDEX "SettingsProfile_userId_idx" ON "SettingsProfile"("userId");

-- CreateIndex
CREATE INDEX "SettingsProfile_published_idx" ON "SettingsProfile"("published");

-- CreateIndex
CREATE INDEX "SettingsProfile_downloadCount_idx" ON "SettingsProfile"("downloadCount");

-- CreateIndex
CREATE INDEX "Comment_settingsProfileId_idx" ON "Comment"("settingsProfileId");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "Star_settingsProfileId_idx" ON "Star"("settingsProfileId");

-- CreateIndex
CREATE INDEX "Star_userId_idx" ON "Star"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Star_settingsProfileId_userId_key" ON "Star"("settingsProfileId", "userId");

-- AddForeignKey
ALTER TABLE "SettingsProfile" ADD CONSTRAINT "SettingsProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_settingsProfileId_fkey" FOREIGN KEY ("settingsProfileId") REFERENCES "SettingsProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Star" ADD CONSTRAINT "Star_settingsProfileId_fkey" FOREIGN KEY ("settingsProfileId") REFERENCES "SettingsProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Star" ADD CONSTRAINT "Star_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
