import { Suspense } from "react"
import Link from "next/link"
import { FilterSidebar } from "@/components/FilterSidebar"
import { TalentGrid } from "@/components/TalentGrid"
import { CastingSearch } from "@/components/CastingSearch"
import { MobileFilterSheet } from "@/components/MobileFilterSheet"
import { AIConcierge } from "@/components/AIConcierge"
import { SortSelect } from "@/components/SortSelect"
import { PageContainer } from "@/components/PageContainer"
import { AnimateOnScroll } from "@/components/AnimateOnScroll"
import { createClient } from "@/utils/supabase/server"
import { getSavedCreatorIds } from "@/app/actions/saved"
import { enrichProfilesWithMeta } from "@/lib/enrich-profiles"

interface DiscoverPageProps {
  searchParams: Promise<{ roles?: string; maxRate?: string; q?: string; sort?: string }>
}

function FilterSidebarFallback() {
  return (
    <div className="h-64 animate-pulse rounded-xl border bg-card shadow-sm" />
  )
}

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const { roles, maxRate, q, sort } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from("profiles")
    .select("id, display_name, avatar_url, hourly_rate, roles")
    .eq("is_discoverable", true)
    .order("display_name", { ascending: true })

  if (roles) {
    const roleList = roles.split(",").filter(Boolean).map((r) => r.replace(/[^a-zA-Z0-9 _-]/g, ""))
    if (roleList.length === 1) {
      query = query.contains("roles", roleList)
    } else if (roleList.length > 1) {
      const orFilter = roleList.map((r) => `roles.cs.{"${r}"}`).join(",")
      query = query.or(orFilter)
    }
  }
  if (maxRate) {
    const parsedRate = Number(maxRate)
    if (isFinite(parsedRate)) {
      query = query.lte("hourly_rate", parsedRate)
    }
  }
  if (q) {
    const escaped = q.replace(/[%_]/g, "")
    query = query.or(
      `display_name.ilike.%${escaped}%,bio.ilike.%${escaped}%`
    )
  }

  const { data: profiles } = await query

  const savedIds = await getSavedCreatorIds()
  const enrichedProfiles = await enrichProfilesWithMeta(
    supabase,
    profiles ?? [],
    savedIds,
  )

  const sorted = [...enrichedProfiles].sort((a, b) => {
    switch (sort) {
      case "price_asc":
        return (a.hourly_rate ?? Infinity) - (b.hourly_rate ?? Infinity)
      case "price_desc":
        return (b.hourly_rate ?? 0) - (a.hourly_rate ?? 0)
      case "rating":
        return (b.avg_rating ?? 0) - (a.avg_rating ?? 0)
      default:
        return 0
    }
  })

  const hasFilters = Boolean(roles || maxRate || q || sort)

  return (
    <div className="min-h-screen bg-background">
      <PageContainer>
        <AnimateOnScroll className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl tracking-tight">
              Discover Talent
            </h1>
            <p className="mt-2 text-muted-foreground">
              Find the right creative professional for your next project.
            </p>
          </div>
          {/* Mobile filter trigger */}
          <div className="md:hidden">
            <Suspense fallback={null}>
              <MobileFilterSheet />
            </Suspense>
          </div>
        </AnimateOnScroll>

        <Suspense fallback={null}>
          <CastingSearch />
        </Suspense>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 items-start">
          <div className="col-span-1 hidden md:block">
            <Suspense fallback={<FilterSidebarFallback />}>
              <FilterSidebar />
            </Suspense>
          </div>

          <main className="col-span-1 md:col-span-3">
            {sorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-20 text-center shadow-sm">
                <p className="text-lg font-medium">No talent found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {hasFilters
                    ? "Try broadening your filters to see more creators."
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
              <>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {sorted.length} {sorted.length === 1 ? "creator" : "creators"} found
                  </p>
                  <Suspense fallback={null}>
                    <SortSelect />
                  </Suspense>
                </div>
                <TalentGrid profiles={sorted} />
              </>
            )}
          </main>
        </div>
      </PageContainer>

      {sorted.length > 0 && <AIConcierge profiles={sorted} />}
    </div>
  )
}
