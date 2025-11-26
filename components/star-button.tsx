"use client";

import { useState, useTransition, useEffect } from "react";
import { Star } from "lucide-react";
import {
  addOrUpdateStar,
  getUserRating,
  getStarStats,
} from "@/lib/actions/stars";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface StarButtonProps {
  profileId: string;
  userId?: string;
  profileOwnerId: string;
  initialAverageRating: number;
  initialTotalRatings: number;
}

export function StarButton({
  profileId,
  userId,
  profileOwnerId,
  initialAverageRating,
  initialTotalRatings,
}: StarButtonProps) {
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState(initialAverageRating);
  const [totalRatings, setTotalRatings] = useState(initialTotalRatings);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (userId) {
      getUserRating({ settingsProfileId: profileId, userId }).then(
        setUserRating,
      );
    }
  }, [profileId, userId]);

  const handleRating = (rating: number) => {
    if (!userId) {
      toast.error("Please sign in to rate settings");
      return;
    }

    // Check if user is the owner
    if (userId === profileOwnerId) {
      toast.error("You cannot rate your own settings");
      return;
    }

    startTransition(async () => {
      try {
        await addOrUpdateStar({
          settingsProfileId: profileId,
          userId,
          rating,
        });

        setUserRating(rating);
        toast.success(`Rated ${rating} star${rating === 1 ? "" : "s"}!`);

        // Refresh stats
        const stats = await getStarStats(profileId);
        setAverageRating(stats.averageRating);
        setTotalRatings(stats.totalRatings);
      } catch (err: any) {
        toast.error(err.message || "Failed to rate settings");
      }
    });
  };

  const isOwner = userId === profileOwnerId;

  return (
    <div className="flex flex-col gap-2 items-center">
      <div className="flex items-center gap-2">
        {/* Star rating buttons */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => handleRating(rating)}
              onMouseEnter={() => setHoveredRating(rating)}
              onMouseLeave={() => setHoveredRating(null)}
              disabled={isPending || isOwner}
              className={`transition-all ${
                isOwner ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              }`}
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  (hoveredRating !== null && rating <= hoveredRating) ||
                  (hoveredRating === null &&
                    userRating !== null &&
                    rating <= userRating)
                    ? "fill-primary text-primary"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Rating stats */}
        <div className="text-sm text-muted-foreground">
          {averageRating > 0 ? (
            <>
              <span className="font-semibold text-foreground">
                {averageRating.toFixed(1)}
              </span>{" "}
              ({totalRatings} {totalRatings === 1 ? "rating" : "ratings"})
            </>
          ) : (
            <span>No ratings yet</span>
          )}
        </div>
      </div>

      {/* User's current rating */}
      {userRating && !isOwner && (
        <p className="text-xs text-muted-foreground">
          Your rating: {userRating} {userRating === 1 ? "star" : "stars"}
        </p>
      )}
    </div>
  );
}
