import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

type BaseProfile = {
  id: string
  display_name: string
  avatar_url: string | null
  hourly_rate: number | null
  roles: string[] | null
}

export type EnrichedProfile = BaseProfile & {
  portfolio_thumbnails: string[]
  avg_rating: number | null
  review_count: number
  isSaved: boolean
}

export async function enrichProfilesWithMeta(
  supabase: SupabaseClient<Database>,
  profiles: BaseProfile[],
  savedIds: Set<string>,
): Promise<EnrichedProfile[]> {
  const profileIds = profiles.map((p) => p.id)

  const thumbnailsMap = new Map<string, string[]>()
  const ratingsMap = new Map<string, { avg: number; count: number }>()

  if (profileIds.length > 0) {
    const [{ data: portfolioItems }, { data: ratings }] = await Promise.all([
      supabase
        .from("portfolio_items")
        .select("profile_id, thumbnail_url")
        .in("profile_id", profileIds)
        .order("sort_order", { ascending: true }),
      supabase
        .from("profile_ratings")
        .select("profile_id, avg_rating, review_count")
        .in("profile_id", profileIds),
    ])

    if (portfolioItems) {
      for (const item of portfolioItems) {
        if (!item.thumbnail_url) continue
        const existing = thumbnailsMap.get(item.profile_id) ?? []
        if (existing.length < 4) {
          existing.push(item.thumbnail_url)
          thumbnailsMap.set(item.profile_id, existing)
        }
      }
    }

    if (ratings) {
      for (const r of ratings) {
        ratingsMap.set(r.profile_id, {
          avg: r.avg_rating,
          count: r.review_count,
        })
      }
    }
  }

  return profiles.map((p) => ({
    ...p,
    portfolio_thumbnails: thumbnailsMap.get(p.id) ?? [],
    avg_rating: ratingsMap.get(p.id)?.avg ?? null,
    review_count: ratingsMap.get(p.id)?.count ?? 0,
    isSaved: savedIds.has(p.id),
  }))
}
