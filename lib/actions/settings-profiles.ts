"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type NvidiaSettings = {
  brightness?: number;
  contrast?: number;
  gamma?: number;
  digitalVibrance?: number;
  hue?: number;
};

export type AmdSettings = {
  colorTempControl?: boolean;
  brightness?: number; // -100 to 100
  hue?: number; // -30 to 30
  contrast?: number; // 0 to 200
  saturation?: number; // 0 to 200
  displayColorEnhancement?:
    | "DynamicContrast"
    | "VividGaming"
    | "UseGlobalSettings"
    | "Disabled";
  dynamicContrastValue?: number; // 0 to 10
};

export type CreateSettingsProfileData = {
  name: string;
  description?: string;
  gpuBrand: "NVIDIA" | "AMD" | "BOTH"; // Primary brand or both
  nvidiaSettings?: NvidiaSettings;
  amdSettings?: AmdSettings;
  gameSettings: any; // JSON object
  soundSettings: any; // JSON object
  postFxSettings: any; // JSON object
  graphicsSettings: any; // JSON object
  controlSettings: any; // JSON object
  published?: boolean;
};

/**
 * Get all published settings profiles
 */
export async function getPublishedSettingsProfiles() {
  try {
    const profiles = await prisma.settingsProfile.findMany({
      where: { published: true },
      include: {
        user: {
          select: {
            twitchUsername: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: { stars: true, comments: true },
        },
      },
      orderBy: { downloadCount: "desc" },
    });
    return profiles;
  } catch (error) {
    console.error("Error fetching published settings profiles:", error);
    throw new Error("Failed to fetch settings profiles");
  }
}

/**
 * Get settings profile by ID
 */
export async function getSettingsProfileById(id: string) {
  try {
    const profile = await prisma.settingsProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            twitchUsername: true,
            avatarUrl: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                twitchUsername: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { stars: true, comments: true },
        },
      },
    });
    return profile;
  } catch (error) {
    console.error("Error fetching settings profile:", error);
    throw new Error("Failed to fetch settings profile");
  }
}

/**
 * Get user's settings profiles (including unpublished for the owner)
 */
export async function getUserSettingsProfiles(userId: string, includeUnpublished = false) {
  try {
    const profiles = await prisma.settingsProfile.findMany({
      where: {
        userId,
        ...(includeUnpublished ? {} : { published: true }),
      },
      include: {
        _count: {
          select: { stars: true, comments: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return profiles;
  } catch (error) {
    console.error("Error fetching user settings profiles:", error);
    throw new Error("Failed to fetch user settings profiles");
  }
}

/**
 * Create a new settings profile
 */
export async function createSettingsProfile(
  userId: string,
  data: CreateSettingsProfileData
) {
  try {
    const gpuData: any = {
      gpuBrand: data.gpuBrand === "BOTH" ? "NVIDIA" : data.gpuBrand, // Store primary brand in DB
    };

    // Add NVIDIA settings if provided
    if (data.nvidiaSettings) {
      gpuData.nvidiaBrightness = data.nvidiaSettings.brightness;
      gpuData.nvidiaContrast = data.nvidiaSettings.contrast;
      gpuData.nvidiaGamma = data.nvidiaSettings.gamma;
      gpuData.nvidiaDigitalVibrance = data.nvidiaSettings.digitalVibrance;
      gpuData.nvidiaHue = data.nvidiaSettings.hue;
    }

    // Add AMD settings if provided
    if (data.amdSettings) {
      gpuData.amdColorTempControl = data.amdSettings.colorTempControl;
      gpuData.amdBrightness = data.amdSettings.brightness;
      gpuData.amdHue = data.amdSettings.hue;
      gpuData.amdContrast = data.amdSettings.contrast;
      gpuData.amdSaturation = data.amdSettings.saturation;
      gpuData.amdDisplayColorEnhancement = data.amdSettings.displayColorEnhancement;
      gpuData.amdDynamicContrastValue = data.amdSettings.dynamicContrastValue;
    }

    const profile = await prisma.settingsProfile.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        published: data.published ?? false,
        ...gpuData,
        gameSettings: data.gameSettings,
        soundSettings: data.soundSettings,
        postFxSettings: data.postFxSettings,
        graphicsSettings: data.graphicsSettings,
        controlSettings: data.controlSettings,
      },
    });

    revalidatePath("/");
    return profile;
  } catch (error) {
    console.error("Error creating settings profile:", error);
    throw new Error("Failed to create settings profile");
  }
}

/**
 * Update settings profile
 */
export async function updateSettingsProfile(
  id: string,
  data: Partial<CreateSettingsProfileData>
) {
  try {
    const updateData: any = {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.published !== undefined && { published: data.published }),
      ...(data.gameSettings && { gameSettings: data.gameSettings }),
      ...(data.soundSettings && { soundSettings: data.soundSettings }),
      ...(data.postFxSettings && { postFxSettings: data.postFxSettings }),
      ...(data.graphicsSettings && { graphicsSettings: data.graphicsSettings }),
      ...(data.controlSettings && { controlSettings: data.controlSettings }),
    };

    if (data.gpuBrand) {
      updateData.gpuBrand = data.gpuBrand === "BOTH" ? "NVIDIA" : data.gpuBrand;
    }

    // Update NVIDIA settings if provided
    if (data.nvidiaSettings) {
      updateData.nvidiaBrightness = data.nvidiaSettings.brightness;
      updateData.nvidiaContrast = data.nvidiaSettings.contrast;
      updateData.nvidiaGamma = data.nvidiaSettings.gamma;
      updateData.nvidiaDigitalVibrance = data.nvidiaSettings.digitalVibrance;
      updateData.nvidiaHue = data.nvidiaSettings.hue;
    }

    // Update AMD settings if provided
    if (data.amdSettings) {
      updateData.amdColorTempControl = data.amdSettings.colorTempControl;
      updateData.amdBrightness = data.amdSettings.brightness;
      updateData.amdHue = data.amdSettings.hue;
      updateData.amdContrast = data.amdSettings.contrast;
      updateData.amdSaturation = data.amdSettings.saturation;
      updateData.amdDisplayColorEnhancement = data.amdSettings.displayColorEnhancement;
      updateData.amdDynamicContrastValue = data.amdSettings.dynamicContrastValue;
    }

    const profile = await prisma.settingsProfile.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/");
    return profile;
  } catch (error) {
    console.error("Error updating settings profile:", error);
    throw new Error("Failed to update settings profile");
  }
}

/**
 * Delete settings profile
 */
export async function deleteSettingsProfile(id: string) {
  try {
    await prisma.settingsProfile.delete({
      where: { id },
    });
    revalidatePath("/");
  } catch (error) {
    console.error("Error deleting settings profile:", error);
    throw new Error("Failed to delete settings profile");
  }
}

/**
 * Increment view count
 */
export async function incrementViewCount(id: string) {
  try {
    await prisma.settingsProfile.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  } catch (error) {
    console.error("Error incrementing view count:", error);
  }
}

/**
 * Increment download count
 */
export async function incrementDownloadCount(id: string) {
  try {
    await prisma.settingsProfile.update({
      where: { id },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });
    revalidatePath("/");
  } catch (error) {
    console.error("Error incrementing download count:", error);
  }
}
