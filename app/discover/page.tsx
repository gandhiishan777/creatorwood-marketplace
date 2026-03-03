import { Suspense } from "react"
import Link from "next/link"
import { FilterSidebar } from "@/components/FilterSidebar"
import { TalentCard } from "@/components/TalentCard"
import { createClient } from "@/utils/supabase/server"

interface DiscoverPageProps {
  searchParams: Promise<{ role?: string; maxRate?: string }>
}

function FilterSidebarFallback() {
  return (
    <div className="h-64 animate-pulse rounded-xl border bg-card shadow-sm" />
  )
}

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const { role, maxRate } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from("profiles")
    .select("id, display_name, avatar_url, bio, hourly_rate, roles")
    .eq("is_discoverable", true)
    .order("display_name", { ascending: true })

  if (role) {
    query = query.contains("roles", [role])
  }
  if (maxRate) {
    query = query.lte("hourly_rate", Number(maxRate))
  }

  const { data: profiles } = await query

  const hasFilters = Boolean(role || maxRate)

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Discover Talent
          </h1>
          <p className="mt-2 text-muted-foreground">
            Find the right creative professional for your next project.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-8 items-start">
          <div className="col-span-1">
            <Suspense fallback={<FilterSidebarFallback />}>
              <FilterSidebar />
            </Suspense>
          </div>

          <main className="col-span-3">
            {!profiles || profiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-20 text-center shadow-sm">
                <p className="text-lg font-medium">No talent found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {hasFilters
                    ? "No talent matches these filters."
                    : "No discoverable profiles yet. Check back soon."}
                </p>
                {hasFilters && (
                  <Link
                    href="/discover"
                    className="mt-4 text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Clear all filters
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {profiles.map((profile) => (
                  <TalentCard
                    key={profile.id}
                    id={profile.id}
                    display_name={profile.display_name}
                    avatar_url={profile.avatar_url}
                    roles={profile.roles}
                    hourly_rate={profile.hourly_rate}
                    bio={profile.bio}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
