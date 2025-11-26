import {
  getSettingsProfileById,
  incrementViewCount,
} from "@/lib/actions/settings-profiles";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, MessageSquare, Star } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  parseSettings,
  extractKeySettings,
  extractKeybinds,
  formatAllSettings,
} from "@/lib/settings-parser";
import { StarButton } from "@/components/star-button";
import { CommentSection } from "@/components/comment-section";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getStarStats } from "@/lib/actions/stars";
import { getUserByClerkId, syncUser } from "@/lib/actions/users";
import { SettingsDisplay } from "@/components/settings-display";

interface SettingsDetailPageProps {
  params: {
    username: string;
    id: string;
  };
}

export default async function SettingsDetailPage({
  params,
}: SettingsDetailPageProps) {
  const { id } = await params;
  const profile = await getSettingsProfileById(id);

  if (!profile) {
    notFound();
  }

  // Increment view count (don't await)
  incrementViewCount(id).catch((err) =>
    console.error("Error incrementing view count:", err),
  );

  const { userId: clerkUserId } = await auth();
  const starStats = await getStarStats(id);

  // Sync user to database if they're logged in
  let dbUserId: string | undefined;
  if (clerkUserId) {
    let user = await getUserByClerkId(clerkUserId);

    if (!user) {
      // User signed in via Clerk but doesn't exist in our database yet
      const clerkUser = await currentUser();

      if (clerkUser) {
        // Extract Twitch username from Clerk external accounts
        const twitchAccount = clerkUser.externalAccounts.find(
          (account) => account.provider === "oauth_twitch",
        );

        const twitchUsername =
          twitchAccount?.username ||
          clerkUser.username ||
          clerkUser.emailAddresses[0]?.emailAddress.split("@")[0] ||
          "user";

        // Sync user to our database
        const syncedUser = await syncUser({
          clerkId: clerkUserId,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          twitchUsername,
          avatarUrl: clerkUser.imageUrl,
        });

        dbUserId = syncedUser.id;
      }
    } else {
      dbUserId = user.id;
    }
  }
  const parsed = parseSettings({
    gameSettings: profile.gameSettings,
    soundSettings: profile.soundSettings,
    postFxSettings: profile.postFxSettings,
    graphicsSettings: profile.graphicsSettings,
    controlSettings: profile.controlSettings,
  });
  const keySettings = extractKeySettings(parsed);
  const keybinds = extractKeybinds(parsed.control);
  const allSettings = formatAllSettings(parsed);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${profile.user.twitchUsername}`}
            className="mb-4 flex items-center gap-3 transition-opacity hover:opacity-70"
          >
            <Avatar className="h-12 w-12 border border-border">
              <AvatarImage
                src={profile.user.avatarUrl || undefined}
                alt={profile.user.twitchUsername}
              />
              <AvatarFallback className="bg-secondary text-foreground">
                {profile.user.twitchUsername.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">Settings by</p>
              <p className="font-semibold text-foreground">
                {profile.user.twitchUsername}
              </p>
            </div>
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground">
                {profile.name}
              </h1>
              {profile.description && (
                <p className="mt-2 text-muted-foreground">
                  {profile.description}
                </p>
              )}
              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{profile.viewCount} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  <span>{profile.downloadCount} downloads</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{profile.comments.length} comments</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span>
                    {starStats.averageRating > 0
                      ? `${starStats.averageRating.toFixed(1)} (${starStats.totalRatings})`
                      : "No ratings"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <StarButton
                profileId={profile.id}
                userId={dbUserId}
                profileOwnerId={profile.userId}
                initialAverageRating={starStats.averageRating}
                initialTotalRatings={starStats.totalRatings}
              />
              <Link href={`/api/settings/${profile.id}/download`}>
                <Button size="lg" className="cursor-pointer">
                  <Download className="mr-2 h-4 w-4" />
                  Download Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - GPU Settings */}
          <div className="space-y-6 lg:col-span-1">
            {/* GPU Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  GPU Settings
                  <Badge>{profile.gpuBrand}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.gpuBrand === "NVIDIA" ? (
                  <div className="space-y-2 text-sm">
                    {profile.nvidiaBrightness !== null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Brightness:
                        </span>
                        <span className="font-medium">
                          {profile.nvidiaBrightness}
                        </span>
                      </div>
                    )}
                    {profile.nvidiaContrast !== null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Contrast:</span>
                        <span className="font-medium">
                          {profile.nvidiaContrast}
                        </span>
                      </div>
                    )}
                    {profile.nvidiaGamma !== null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gamma:</span>
                        <span className="font-medium">
                          {profile.nvidiaGamma}
                        </span>
                      </div>
                    )}
                    {profile.nvidiaDigitalVibrance !== null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Digital Vibrance:
                        </span>
                        <span className="font-medium">
                          {profile.nvidiaDigitalVibrance}
                        </span>
                      </div>
                    )}
                    {profile.nvidiaHue !== null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hue:</span>
                        <span className="font-medium">{profile.nvidiaHue}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    {profile.amdColorTempControl !== null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Color Temp Control:
                        </span>
                        <span className="font-medium">
                          {profile.amdColorTempControl ? "On" : "Off"}
                        </span>
                      </div>
                    )}
                    {profile.amdBrightness !== null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Brightness:
                        </span>
                        <span className="font-medium">
                          {profile.amdBrightness}
                        </span>
                      </div>
                    )}
                    {profile.amdHue !== null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hue:</span>
                        <span className="font-medium">{profile.amdHue}</span>
                      </div>
                    )}
                    {profile.amdContrast !== null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Contrast:</span>
                        <span className="font-medium">
                          {profile.amdContrast}
                        </span>
                      </div>
                    )}
                    {profile.amdSaturation !== null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Saturation:
                        </span>
                        <span className="font-medium">
                          {profile.amdSaturation}
                        </span>
                      </div>
                    )}
                    {profile.amdDisplayColorEnhancement && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Display Enhancement:
                        </span>
                        <span className="font-medium">
                          {profile.amdDisplayColorEnhancement}
                        </span>
                      </div>
                    )}
                    {profile.amdDynamicContrastValue !== null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Dynamic Contrast:
                        </span>
                        <span className="font-medium">
                          {profile.amdDynamicContrastValue}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Game Settings */}
          <div className="space-y-6 lg:col-span-2">
            {/* Settings Display with Tabs */}
            <SettingsDisplay
              keySettings={keySettings}
              keybinds={keybinds}
              allSettings={allSettings}
            />

            {/* Comments Section */}
            <CommentSection
              profileId={profile.id}
              initialComments={profile.comments}
              userId={dbUserId}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
