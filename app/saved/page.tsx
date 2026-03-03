import { redirect } from "next/navigation"
import Link from "next/link"
import { Heart, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TalentGrid } from "@/components/TalentGrid"
import { createClient } from "@/utils/supabase/server"

export default async function SavedPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) redirect("/login")

  const { data: saves } = await supabase
    .from("saved_creators")
    .select("creator_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const creatorIds = (saves ?? []).map((s) => s.creator_id)

  if (creatorIds.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <Heart className="mx-auto mb-4 size-10 text-muted-foreground/30" />
          <h1 className="text-2xl font-bold tracking-tight">No saved creators yet</h1>
          <p className="mt-2 text-muted-foreground">
            Browse the marketplace and save creators you&apos;d like to work with.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/discover">
              Discover Talent
              <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, bio, hourly_rate, roles")
    .in("id", creatorIds)

  let thumbnailsMap = new Map<string, string[]>()
  if (creatorIds.length > 0) {
    const { data: portfolioItems } = await supabase
      .from("portfolio_items")
      .select("profile_id, thumbnail_url")
      .in("profile_id", creatorIds)
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

  let ratingsMap = new Map<string, { avg: number; count: number }>()
  if (creatorIds.length > 0) {
    const { data: ratings } = await supabase
      .from("profile_ratings")
      .select("profile_id, avg_rating, review_count")
      .in("profile_id", creatorIds)

    if (ratings) {
      for (const r of ratings) {
        ratingsMap.set(r.profile_id, { avg: r.avg_rating, count: r.review_count })
      }
    }
  }

  const savedSet = new Set(creatorIds)

  const enrichedProfiles = (profiles ?? []).map((p) => ({
    ...p,
    portfolio_thumbnails: thumbnailsMap.get(p.id) ?? [],
    avg_rating: ratingsMap.get(p.id)?.avg ?? null,
    review_count: ratingsMap.get(p.id)?.count ?? 0,
    isSaved: savedSet.has(p.id),
  }))

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Saved Creators</h1>
          <p className="mt-2 text-muted-foreground">
            Creators you&apos;ve bookmarked for later.
          </p>
        </div>
        <TalentGrid profiles={enrichedProfiles} />
      </div>
    </div>
  )
}
