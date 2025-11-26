"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Create a comment on a settings profile
 */
export async function createComment(data: {
  settingsProfileId: string;
  userId: string;
  content: string;
}) {
  try {
    // Validate content
    if (!data.content || data.content.trim().length === 0) {
      throw new Error("Comment cannot be empty");
    }

    if (data.content.length > 1000) {
      throw new Error("Comment is too long (max 1000 characters)");
    }

    const comment = await prisma.comment.create({
      data: {
        settingsProfileId: data.settingsProfileId,
        userId: data.userId,
        content: data.content.trim(),
      },
      include: {
        user: {
          select: {
            twitchUsername: true,
            avatarUrl: true,
          },
        },
      },
    });

    revalidatePath(`/`, "layout");
    return comment;
  } catch (error: any) {
    console.error("Error creating comment:", error);
    // Return a more descriptive error message
    if (error.code === "P2003") {
      throw new Error("User not found. Please sign in again.");
    }
    throw error;
  }
}

/**
 * Get comments for a settings profile
 */
export async function getComments(settingsProfileId: string) {
  try {
    const comments = await prisma.comment.findMany({
      where: { settingsProfileId },
      include: {
        user: {
          select: {
            twitchUsername: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return comments;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw new Error("Failed to fetch comments");
  }
}

/**
 * Delete a comment (for future admin functionality)
 */
export async function deleteComment(id: string) {
  try {
    const comment = await prisma.comment.delete({
      where: { id },
    });
    revalidatePath(`/`, "layout");
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw new Error("Failed to delete comment");
  }
}
