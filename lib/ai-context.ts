import { createClient } from "@/utils/supabase/server"

export async function buildCreatorContext(): Promise<string> {
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, bio, roles, hourly_rate")
    .eq("is_discoverable", true)
    .order("display_name", { ascending: true })

  if (!profiles || profiles.length === 0) {
    return "No creators are currently available on the platform."
  }

  const profileIds = profiles.map((p) => p.id)

  const { data: ratings } = await supabase
    .from("profile_ratings")
    .select("profile_id, avg_rating, review_count")
    .in("profile_id", profileIds)

  const ratingsMap = new Map<string, { avg: number; count: number }>()
  if (ratings) {
    for (const r of ratings) {
      ratingsMap.set(r.profile_id, { avg: r.avg_rating, count: r.review_count })
    }
  }

  const { data: reviews } = await supabase
    .from("reviews")
    .select("target_id, rating, comment, reviewer:profiles!reviews_reviewer_id_fkey(display_name)")
    .in("target_id", profileIds)
    .not("comment", "is", null)
    .order("created_at", { ascending: false })

  const reviewsMap = new Map<string, { rating: number; comment: string; reviewer: string }[]>()
  if (reviews) {
    for (const r of reviews) {
      const list = reviewsMap.get(r.target_id) ?? []
      const reviewerName =
        (r.reviewer as unknown as { display_name: string })?.display_name ?? "Anonymous"
      if (r.comment) {
        list.push({ rating: r.rating, comment: r.comment, reviewer: reviewerName })
      }
      reviewsMap.set(r.target_id, list)
    }
  }

  const sections = profiles.map((p) => {
    const r = ratingsMap.get(p.id)
    const revs = reviewsMap.get(p.id) ?? []
    const rolesStr = p.roles?.join(", ") ?? "No roles listed"
    const rateStr = p.hourly_rate != null ? `$${p.hourly_rate}/hr` : "Rate negotiable"
    const ratingStr = r ? `${r.avg} avg (${r.count} reviews)` : "No reviews yet"

    let section = `## Creator: ${p.display_name} (ID: ${p.id})\n`
    section += `Roles: ${rolesStr} | Rate: ${rateStr} | Rating: ${ratingStr}\n`
    if (p.bio) section += `Bio: ${p.bio}\n`

    if (revs.length > 0) {
      section += "Reviews:\n"
      for (const rev of revs.slice(0, 5)) {
        section += `- "${rev.comment}" (${rev.rating} stars, by ${rev.reviewer})\n`
      }
    }

    return section
  })

  return sections.join("\n")
}
