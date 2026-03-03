import { redirect } from "next/navigation"
import Link from "next/link"
import { Heart, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TalentGrid } from "@/components/TalentGrid"
import { PageContainer } from "@/components/PageContainer"
import { AnimateOnScroll } from "@/components/AnimateOnScroll"
import { createClient } from "@/utils/supabase/server"
import { enrichProfilesWithMeta } from "@/lib/enrich-profiles"

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
          <h1 className="font-display text-2xl tracking-tight">No saved creators yet</h1>
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
    .select("id, display_name, avatar_url, hourly_rate, roles")
    .in("id", creatorIds)

  const savedSet = new Set(creatorIds)
  const enrichedProfiles = await enrichProfilesWithMeta(
    supabase,
    profiles ?? [],
    savedSet,
  )

  return (
    <div className="min-h-screen bg-background">
      <PageContainer>
        <AnimateOnScroll className="mb-8">
          <h1 className="font-display text-3xl tracking-tight">Saved Creators</h1>
          <p className="mt-2 text-muted-foreground">
            Creators you&apos;ve bookmarked for later.
          </p>
        </AnimateOnScroll>
        <TalentGrid profiles={enrichedProfiles} />
      </PageContainer>
    </div>
  )
}
