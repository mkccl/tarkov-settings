import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByClerkId, syncUser } from "@/lib/actions/users";
import { CreateSettingsForm } from "@/components/create-settings-form";

export default async function CreateSettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get user from database, or create if doesn't exist
  let user = await getUserByClerkId(userId);

  if (!user) {
    // User signed in via Clerk but doesn't exist in our database yet
    // Get their full profile from Clerk and create in our database
    const clerkUser = await currentUser();

    if (!clerkUser) {
      redirect("/sign-in");
    }

    // Extract Twitch username from Clerk external accounts
    const twitchAccount = clerkUser.externalAccounts.find(
      (account) => account.provider === "oauth_twitch"
    );

    const twitchUsername =
      twitchAccount?.username ||
      clerkUser.username ||
      clerkUser.emailAddresses[0]?.emailAddress.split("@")[0] ||
      "user";

    // Sync user to our database
    const syncedUser = await syncUser({
      clerkId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
      twitchUsername,
      avatarUrl: clerkUser.imageUrl,
    });

    // Re-fetch the user with the settingsProfiles relation
    user = await getUserByClerkId(userId);

    if (!user) {
      // This should never happen, but handle it just in case
      redirect("/sign-in");
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Create Settings Profile
          </h1>
          <p className="mt-2 text-muted-foreground">
            Share your Tarkov settings with the community
          </p>
        </div>

        <CreateSettingsForm userId={user.id} twitchUsername={user.twitchUsername} />
      </div>
    </main>
  );
}
