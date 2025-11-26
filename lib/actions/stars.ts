"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Add or update star rating (1-5 stars)
 */
export async function addOrUpdateStar(data: {
  settingsProfileId: string;
  userId: string;
  rating: number; // 1-5
}) {
  try {
    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    // Check if user is trying to rate their own settings
    const profile = await prisma.settingsProfile.findUnique({
      where: { id: data.settingsProfileId },
      select: { userId: true },
    });

    if (!profile) {
      throw new Error("Settings profile not found");
    }

    if (profile.userId === data.userId) {
      throw new Error("You cannot rate your own settings");
    }

    // Upsert the star (create or update)
    const star = await prisma.star.upsert({
      where: {
        settingsProfileId_userId: {
          settingsProfileId: data.settingsProfileId,
          userId: data.userId,
        },
      },
      update: {
        rating: data.rating,
      },
      create: {
        settingsProfileId: data.settingsProfileId,
        userId: data.userId,
        rating: data.rating,
      },
    });

    revalidatePath(`/`, "layout");
    return star;
  } catch (error) {
    console.error("Error adding/updating star:", error);
    throw error;
  }
}

/**
 * Remove star rating
 */
export async function removeStar(data: {
  settingsProfileId: string;
  userId: string;
}) {
  try {
    await prisma.star.delete({
      where: {
        settingsProfileId_userId: {
          settingsProfileId: data.settingsProfileId,
          userId: data.userId,
        },
      },
    });

    revalidatePath(`/`, "layout");
  } catch (error) {
    console.error("Error removing star:", error);
    throw new Error("Failed to remove star");
  }
}

/**
 * Get user's rating for a settings profile
 */
export async function getUserRating(data: {
  settingsProfileId: string;
  userId: string;
}) {
  try {
    const star = await prisma.star.findUnique({
      where: {
        settingsProfileId_userId: {
          settingsProfileId: data.settingsProfileId,
          userId: data.userId,
        },
      },
    });
    return star?.rating || null;
  } catch (error) {
    console.error("Error getting user rating:", error);
    return null;
  }
}

/**
 * Get average rating and total count for a settings profile
 */
export async function getStarStats(settingsProfileId: string) {
  try {
    const stars = await prisma.star.findMany({
      where: { settingsProfileId },
      select: { rating: true },
    });

    if (stars.length === 0) {
      return { averageRating: 0, totalRatings: 0 };
    }

    const totalRating = stars.reduce((sum, star) => sum + star.rating, 0);
    const averageRating = totalRating / stars.length;

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalRatings: stars.length,
    };
  } catch (error) {
    console.error("Error getting star stats:", error);
    return { averageRating: 0, totalRatings: 0 };
  }
}
