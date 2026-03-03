import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/utils/supabase/server"
import { GlowButton, CinematicPresenceStatus } from "@/components/ProfileHero"
import { PortfolioGallery } from "@/components/PortfolioGallery"
import { RatingSummary, TestimonialsList } from "@/components/ReviewsDisplay"
import { SaveButton } from "@/components/SaveButton"
import { AnimateOnScroll } from "@/components/AnimateOnScroll"
import { getSavedCreatorIds } from "@/app/actions/saved"
import { getInitials } from "@/lib/utils"

interface ProfilePageProps {
  params: Promise<{ id: string }>
}

function extractTagline(bio: string | null): string | null {
  if (!bio) return null
  const firstSentence = bio.match(/^[^.!?]+[.!?]/)
  if (firstSentence && firstSentence[0].length < 120) {
    return firstSentence[0].trim()
  }
  return null
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: profile }, { data: portfolioItems }, { data: reviews }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", id).single(),
      supabase
        .from("portfolio_items")
        .select("*")
        .eq("profile_id", id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("reviews")
        .select(
          "*, reviewer:profiles!reviews_reviewer_id_fkey(display_name, avatar_url)"
        )
        .eq("target_id", id)
        .order("created_at", { ascending: false }),
    ])

  if (!profile) {
    notFound()
  }

  const { data: { user } } = await supabase.auth.getUser()

  const savedIds = await getSavedCreatorIds()
  const isSaved = savedIds.has(id)

  const reviewList = (reviews ?? []) as Array<{
    id: string
    rating: number
    comment: string | null
    created_at: string | null
    reviewer: { display_name: string; avatar_url: string | null }
  }>
  const totalReviews = reviewList.length
  const avgRating =
    totalReviews > 0
      ? Math.round(
          (reviewList.reduce((sum, r) => sum + r.rating, 0) / totalReviews) *
            10
        ) / 10
      : null

  const heroImage = (portfolioItems ?? []).find(
    (item) => item.thumbnail_url
  )?.thumbnail_url
  const tagline = extractTagline(profile.bio)

  return (
    <div className="min-h-screen bg-background">
      {/* Full-bleed cinematic hero */}
      <section className="relative h-[55vh] min-h-[400px] w-full overflow-hidden">
        {heroImage ? (
          <img
            src={heroImage}
            alt={`${profile.display_name}'s featured work`}
            className="size-full object-cover animate-[ken-burns_25s_ease-in-out_infinite]"
          />
        ) : (
          <div className="size-full hero-gradient-brand" />
        )}

        {/* Gradient overlay */}
        <div className="hero-gradient absolute inset-0" />

        {/* Profile info overlaid at the bottom */}
        <div className="absolute inset-x-0 bottom-0 z-10">
          <div className="mx-auto max-w-6xl px-4 pb-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
              {/* Avatar overlapping the boundary */}
              <Avatar className="size-24 shrink-0 ring-4 ring-white/20 shadow-2xl sm:size-28">
                <AvatarImage
                  src={profile.avatar_url ?? undefined}
                  alt={profile.display_name}
                />
                <AvatarFallback className="text-3xl bg-black/40 text-white">
                  {getInitials(profile.display_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col gap-2 pb-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-display text-5xl tracking-tight text-white sm:text-6xl">
                    {profile.display_name}
                  </h1>
                  <div className="flex items-center gap-3">
                    <CinematicPresenceStatus userId={profile.id} />
                    <SaveButton
                      creatorId={profile.id}
                      initialSaved={isSaved}
                      size="md"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {profile.hourly_rate != null && (
                    <span className="text-base text-white/80">
                      <span className="font-semibold text-white">
                        ${profile.hourly_rate}
                      </span>
                      /hr
                    </span>
                  )}

                  {profile.roles && profile.roles.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {profile.roles.map((role: string) => (
                        <Badge
                          key={role}
                          variant="secondary"
                          className="border-white/20 bg-white/10 text-white backdrop-blur-sm"
                        >
                          {role}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content area */}
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Pull-quote tagline */}
        {tagline && (
          <AnimateOnScroll className="mb-10">
            <blockquote className="border-l-4 border-brand/40 pl-5">
              <p className="font-display text-2xl italic tracking-tight text-foreground/80">
                {tagline}
              </p>
            </blockquote>
          </AnimateOnScroll>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Left column -- Portfolio */}
          <AnimateOnScroll delay={0.05} className="lg:col-span-3 flex flex-col gap-4">
            <h2 className="font-display text-xl tracking-tight">Portfolio</h2>
            <PortfolioGallery
              items={portfolioItems ?? []}
              creatorName={profile.display_name}
            />
          </AnimateOnScroll>

          {/* Right column -- About + Rating + CTA */}
          <AnimateOnScroll delay={0.1} className="lg:col-span-2 flex flex-col gap-6">
            {/* Rating Summary */}
            <RatingSummary avgRating={avgRating} totalCount={totalReviews} />

            {/* About */}
            <div className="rounded-2xl border bg-card p-6">
              <h2 className="mb-4 font-display text-xl tracking-tight">
                About
              </h2>
              {profile.bio ? (
                <div className="border-l-2 border-brand/30 pl-4">
                  <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
                    {profile.bio}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  This creator hasn&apos;t added a bio yet.
                </p>
              )}

              {profile.roles && profile.roles.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {profile.roles.map((role: string) => (
                    <Badge
                      key={role}
                      variant="outline"
                      className="text-muted-foreground"
                    >
                      {role}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Work Together */}
            <div className="rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/5 via-card to-brand/10 py-8 px-6">
              <h2 className="mb-1 font-display text-lg tracking-tight">
                Like what you see?
              </h2>
              {profile.hourly_rate != null ? (
                <p className="mb-5 text-sm text-muted-foreground">
                  Starting at{" "}
                  <span className="font-semibold text-foreground">
                    ${profile.hourly_rate}/hr
                  </span>
                </p>
              ) : (
                <p className="mb-5 text-sm text-muted-foreground">
                  Send a message to start a conversation.
                </p>
              )}
              <GlowButton
                talentId={profile.id}
                talentName={profile.display_name}
                isAuthenticated={!!user}
              />
            </div>
          </AnimateOnScroll>

          {/* Testimonials -- full width below */}
          {reviewList.length > 0 && (
            <AnimateOnScroll delay={0.15} className="lg:col-span-5">
              <TestimonialsList reviews={reviewList} />
            </AnimateOnScroll>
          )}
        </div>
      </div>
    </div>
  )
}
