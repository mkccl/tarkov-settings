import { SearchBar } from "@/components/search-bar";
import { SettingsCard } from "@/components/settings-card";
import { SettingsFilter } from "@/components/settings-filter";
import { Pagination } from "@/components/pagination";
import { getFilteredSettingsProfiles, SortOption } from "@/lib/actions/search";
import Link from "next/link";

type PageProps = {
  searchParams?: Promise<{
    search?: string;
    sort?: SortOption;
    page?: string;
  }>;
};

export default async function OverviewPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const searchQuery = params?.search;
  const sortBy = params?.sort as SortOption | undefined;
  const page = params?.page ? parseInt(params.page) : 1;

  const result = await getFilteredSettingsProfiles({
    searchQuery,
    sortBy,
    page,
    limit: 12,
  });

  const { data: profiles, pagination } = result;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            tarkov<span className="text-primary">settings</span>
          </h1>
          <p className="mt-3 text-muted-foreground">
            Discover and use settings from top Escape from Tarkov streamers
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar />
        </div>

        {/* Filter Bar */}
        <div className="mb-10 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {pagination.totalCount} {pagination.totalCount === 1 ? "profile" : "profiles"} found
            {pagination.totalPages > 1 && (
              <span className="ml-1">
                (Page {pagination.page} of {pagination.totalPages})
              </span>
            )}
          </div>
          <SettingsFilter />
        </div>

        {/* Settings Grid */}
        {profiles.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg text-muted-foreground">
              {searchQuery
                ? `No settings profiles found for "${searchQuery}"`
                : "No settings profiles published yet. Be the first to share your settings!"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {profiles.map((profile) => (
                <Link key={profile.id} href={`/${profile.user.twitchUsername}/settings/${profile.id}`}>
                  <SettingsCard
                    twitchName={profile.user.twitchUsername}
                    settingsName={profile.name}
                    stars={profile._count.stars}
                    downloads={profile.downloadCount}
                    views={profile.viewCount}
                    comments={profile._count.comments}
                    avatarUrl={profile.user.avatarUrl || undefined}
                    gpuBrand={profile.gpuBrand as "NVIDIA" | "AMD"}
                  />
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              hasNextPage={pagination.hasNextPage}
              hasPrevPage={pagination.hasPrevPage}
            />
          </>
        )}
      </div>
    </main>
  );
}
