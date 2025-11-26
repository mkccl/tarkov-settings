import { getUserByTwitchUsername } from "@/lib/actions/users";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SettingsCard } from "@/components/settings-card";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Prisma } from "@prisma/client";

interface UserProfilePageProps {
  params: {
    username: string;
  };
}

type SettingsProfileWithCount = Prisma.SettingsProfileGetPayload<{
  include: {
    _count: {
      select: { stars: true; comments: true };
    };
  };
}>;

export default async function UserProfilePage({
  params,
}: UserProfilePageProps) {
  const { username } = await params;
  const user = await getUserByTwitchUsername(username);

  if (!user) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* User Header */}
        <div className="mb-10 flex items-center gap-6">
          <Avatar className="h-24 w-24 border-2 border-border">
            <AvatarImage
              src={user.avatarUrl || undefined}
              alt={user.twitchUsername}
            />
            <AvatarFallback className="bg-secondary text-2xl text-foreground">
              {user.twitchUsername.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {user.twitchUsername}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {user.settingsProfiles.length}{" "}
              {user.settingsProfiles.length === 1
                ? "settings profile"
                : "settings profiles"}
            </p>
          </div>
        </div>

        {/* Settings Grid */}
        {user.settingsProfiles.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg text-muted-foreground">
              {user.twitchUsername} hasn&#39;t published any settings yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {user.settingsProfiles.map((profile: SettingsProfileWithCount) => (
              <Link
                key={profile.id}
                href={`/${user.twitchUsername}/settings/${profile.id}`}
              >
                <SettingsCard
                  twitchName={user.twitchUsername}
                  settingsName={profile.name}
                  stars={profile._count.stars}
                  downloads={profile.downloadCount}
                  views={profile.viewCount}
                  comments={profile._count.comments}
                  avatarUrl={user.avatarUrl || undefined}
                  gpuBrand={profile.gpuBrand as "NVIDIA" | "AMD"}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
