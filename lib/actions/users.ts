"use server";

import prisma from "@/lib/prisma";

/**
 * Create or update a user from Clerk/Twitch authentication
 */
export async function syncUser(data: {
  clerkId: string;
  email: string;
  twitchUsername: string;
  avatarUrl?: string;
}) {
  try {
    const user = await prisma.user.upsert({
      where: { clerkId: data.clerkId },
      update: {
        email: data.email,
        twitchUsername: data.twitchUsername,
        avatarUrl: data.avatarUrl,
      },
      create: {
        clerkId: data.clerkId,
        email: data.email,
        twitchUsername: data.twitchUsername,
        avatarUrl: data.avatarUrl,
      },
    });
    return user;
  } catch (error) {
    console.error("Error syncing user:", error);
    throw new Error("Failed to sync user");
  }
}

/**
 * Get user by Clerk ID
 */
export async function getUserByClerkId(clerkId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        settingsProfiles: {
          where: { published: true },
          orderBy: { downloadCount: "desc" },
        },
      },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("Failed to fetch user");
  }
}

/**
 * Get user by Twitch username
 */
export async function getUserByTwitchUsername(twitchUsername: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { twitchUsername },
      include: {
        settingsProfiles: {
          where: { published: true },
          include: {
            _count: {
              select: { stars: true, comments: true },
            },
          },
          orderBy: { downloadCount: "desc" },
        },
      },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user by Twitch username:", error);
    throw new Error("Failed to fetch user");
  }
}

/**
 * Delete user
 */
export async function deleteUser(clerkId: string) {
  try {
    await prisma.user.delete({
      where: { clerkId },
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user");
  }
}
