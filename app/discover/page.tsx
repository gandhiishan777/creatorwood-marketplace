import { Suspense } from "react"
import Link from "next/link"
import { TalentGrid } from "@/components/TalentGrid"
import { AIConcierge } from "@/components/AIConcierge"
import { SortSelect } from "@/components/SortSelect"
import { RolePillFilters } from "@/components/RolePillFilters"
import { PriceFilter } from "@/components/PriceFilter"
import { createClient } from "@/utils/supabase/server"
import { getSavedCreatorIds } from "@/app/actions/saved"
import { enrichProfilesWithMeta } from "@/lib/enrich-profiles"

interface DiscoverPageProps {
  searchParams: Promise<{ roles?: string; maxRate?: string; q?: string; sort?: string }>
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
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Fixed atmospheric glow */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute -top-48 left-1/3 h-[500px] w-[500px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)", filter: "blur(80px)" }}
        />
        <div
          className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)", filter: "blur(80px)" }}
        />
        {/* Right-edge violet wash */}
        <div
          className="absolute inset-y-0 right-0 w-[45%]"
          style={{
            background:
              "radial-gradient(ellipse at right center, rgba(139,92,246,0.18) 0%, rgba(139,92,246,0.08) 35%, transparent 70%)",
          }}
        />
        <div
          className="absolute right-0 top-0 h-full w-px"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(139,92,246,0.5) 50%, transparent 100%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display text-5xl tracking-tight text-white md:text-6xl">
            The Collective
          </h1>
          <p className="mt-3 text-base text-white/50">
            Find the right creative professional for your next project.
          </p>
        </div>

        {/* Filter bar: pills + search | sort */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <Suspense fallback={<div className="h-8 w-64 rounded-full bg-white/5 animate-pulse" />}>
            <RolePillFilters />
          </Suspense>
          <Suspense fallback={<div className="h-8 w-20 rounded-full bg-white/5 animate-pulse" />}>
            <PriceFilter />
          </Suspense>
          <div className="ml-auto shrink-0">
            <Suspense fallback={null}>
              <SortSelect />
            </Suspense>
          </div>
        </div>

        {/* Results */}
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] py-20 text-center backdrop-blur-sm">
            <p className="text-lg font-medium text-white/80">No talent found</p>
            <p className="mt-1 text-sm text-white/40">
              {hasFilters ? "Try broadening your filters." : "No discoverable profiles yet."}
            </p>
            {hasFilters && (
              <Link
                href="/discover"
                className="mt-4 text-sm font-medium text-[#8B5CF6] hover:text-[#a78bfa] transition-colors"
              >
                Clear all filters
              </Link>
            )}
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-white/40">
              {sorted.length} {sorted.length === 1 ? "creator" : "creators"}
            </p>
            <TalentGrid profiles={sorted} />
          </>
        )}
      </div>

      {sorted.length > 0 && <AIConcierge profiles={sorted} />}
    </div>
  )
}
