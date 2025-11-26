"use server";

import prisma from "@/lib/prisma";

export type SortOption =
  | "downloads-desc"
  | "downloads-asc"
  | "views-desc"
  | "views-asc"
  | "stars-desc"
  | "stars-asc"
  | "recent";

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

/**
 * Get filtered and sorted settings profiles with pagination
 */
export async function getFilteredSettingsProfiles(options?: {
  searchQuery?: string;
  sortBy?: SortOption;
  page?: number;
  limit?: number;
}) {
  try {
    const {
      searchQuery,
      sortBy = "downloads-desc",
      page = 1,
      limit = 12,
    } = options || {};

    // Build where clause
    const where: any = { published: true };

    if (searchQuery && searchQuery.trim()) {
      where.OR = [
        {
          user: {
            twitchUsername: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
        },
        {
          name: {
            contains: searchQuery,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Build orderBy clause
    let orderBy: any;
    switch (sortBy) {
      case "downloads-desc":
        orderBy = { downloadCount: "desc" };
        break;
      case "downloads-asc":
        orderBy = { downloadCount: "asc" };
        break;
      case "views-desc":
        orderBy = { viewCount: "desc" };
        break;
      case "views-asc":
        orderBy = { viewCount: "asc" };
        break;
      case "stars-desc":
        orderBy = { stars: { _count: "desc" } };
        break;
      case "stars-asc":
        orderBy = { stars: { _count: "asc" } };
        break;
      case "recent":
        orderBy = { createdAt: "desc" };
        break;
      default:
        orderBy = { downloadCount: "desc" };
    }

    // Get total count for pagination
    const totalCount = await prisma.settingsProfile.count({ where });

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;

    // Fetch paginated results
    const profiles = await prisma.settingsProfile.findMany({
      where,
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
      orderBy,
      skip,
      take: limit,
    });

    return {
      data: profiles,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    console.error("Error fetching filtered settings profiles:", error);
    throw new Error("Failed to fetch settings profiles");
  }
}

/**
 * Search for streamers (users) by username - used for autocomplete
 */
export async function searchStreamers(query: string, limit = 5) {
  try {
    if (!query || !query.trim()) {
      return [];
    }

    const users = await prisma.user.findMany({
      where: {
        twitchUsername: {
          contains: query,
          mode: 'insensitive',
        },
        settingsProfiles: {
          some: {
            published: true,
          },
        },
      },
      select: {
        twitchUsername: true,
        avatarUrl: true,
      },
      take: limit,
    });

    return users;
  } catch (error) {
    console.error("Error searching streamers:", error);
    return [];
  }
}
