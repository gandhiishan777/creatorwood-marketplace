import { Suspense } from "react"
import Link from "next/link"
import { FilterSidebar } from "@/components/FilterSidebar"
import { TalentGrid } from "@/components/TalentGrid"
import { CastingSearch } from "@/components/CastingSearch"
import { MobileFilterSheet } from "@/components/MobileFilterSheet"
import { AIConcierge } from "@/components/AIConcierge"
import { createClient } from "@/utils/supabase/server"
import { getSavedCreatorIds } from "@/app/actions/saved"

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
      const orFilter = roleList.map((r) => `roles.cs.{"${r}"}`).join(",")
      query = query.or(orFilter)
    }
  }
  if (maxRate) {
    query = query.lte("hourly_rate", Number(maxRate))
  }
  if (q) {
    const escaped = q.replace(/%/g, "")
    query = query.or(
      `display_name.ilike.%${escaped}%,bio.ilike.%${escaped}%`
    )
  }

  const { data: profiles } = await query

  const profileIds = profiles?.map((p) => p.id) ?? []

  // Fetch up to 4 portfolio thumbnails per profile
  let thumbnailsMap = new Map<string, string[]>()
  if (profileIds.length > 0) {
    const { data: portfolioItems } = await supabase
      .from("portfolio_items")
      .select("profile_id, thumbnail_url")
      .in("profile_id", profileIds)
      .order("sort_order", { ascending: true })

    if (portfolioItems) {
      for (const item of portfolioItems) {
        if (!item.thumbnail_url) continue
        const existing = thumbnailsMap.get(item.profile_id) ?? []
        if (existing.length < 4) {
          thumbnailsMap.set(item.profile_id, [...existing, item.thumbnail_url])
        }
      }
    }
  }

  // Fetch ratings
  let ratingsMap = new Map<string, { avg: number; count: number }>()
  if (profileIds.length > 0) {
    const { data: ratings } = await supabase
      .from("profile_ratings")
      .select("profile_id, avg_rating, review_count")
      .in("profile_id", profileIds)

    if (ratings) {
      for (const r of ratings) {
        ratingsMap.set(r.profile_id, {
          avg: r.avg_rating,
          count: r.review_count,
        })
      }
    }
  }

  const savedIds = await getSavedCreatorIds()

  const enrichedProfiles = profiles?.map((p) => ({
    ...p,
    portfolio_thumbnails: thumbnailsMap.get(p.id) ?? [],
    avg_rating: ratingsMap.get(p.id)?.avg ?? null,
    review_count: ratingsMap.get(p.id)?.count ?? 0,
    isSaved: savedIds.has(p.id),
  }))

  const hasFilters = Boolean(roles || maxRate || q)

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
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
        </div>

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
            {!enrichedProfiles || enrichedProfiles.length === 0 ? (
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
              <TalentGrid profiles={enrichedProfiles} />
            )}
          </main>
        </div>
      </div>

      {enrichedProfiles && <AIConcierge profiles={enrichedProfiles} />}
    </div>
  )
}
