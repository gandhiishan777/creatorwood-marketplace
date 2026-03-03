import { Suspense } from "react"
import Link from "next/link"
import { FilterSidebar } from "@/components/FilterSidebar"
import { TalentGrid } from "@/components/TalentGrid"
import { CastingSearch } from "@/components/CastingSearch"
import { createClient } from "@/utils/supabase/server"

interface DiscoverPageProps {
  searchParams: Promise<{ roles?: string; maxRate?: string; q?: string }>
}

function FilterSidebarFallback() {
  return (
    <div className="h-64 animate-pulse rounded-xl border bg-card shadow-sm" />
  )
}

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const { roles, maxRate, q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from("profiles")
    .select("id, display_name, avatar_url, bio, hourly_rate, roles")
    .eq("is_discoverable", true)
    .order("display_name", { ascending: true })

  if (roles) {
    const roleList = roles.split(",").filter(Boolean)
    if (roleList.length === 1) {
      query = query.contains("roles", roleList)
    } else if (roleList.length > 1) {
      // Match profiles whose roles array contains ANY of the selected roles
      const orFilter = roleList.map((r) => `roles.cs.{"${r}"}`).join(",")
      query = query.or(orFilter)
    }
  }
  if (maxRate) {
    query = query.lte("hourly_rate", Number(maxRate))
  }
  if (q) {
    // Strip % characters to prevent filter injection, then apply ilike search
    const escaped = q.replace(/%/g, "")
    query = query.or(
      `display_name.ilike.%${escaped}%,bio.ilike.%${escaped}%`
    )
  }

  const { data: profiles } = await query

  const hasFilters = Boolean(roles || maxRate || q)

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

        {/* Casting Search — full width above the grid */}
        <Suspense fallback={null}>
          <CastingSearch />
        </Suspense>

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
              <TalentGrid profiles={profiles} />
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
