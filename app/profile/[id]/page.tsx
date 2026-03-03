import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/utils/supabase/server"
import { GlowButton, PresenceStatus } from "@/components/ProfileHero"
import { PortfolioGallery } from "@/components/PortfolioGallery"
import { RatingSummary, TestimonialsList } from "@/components/ReviewsDisplay"
import { getInitials } from "@/lib/utils"

interface ProfilePageProps {
  params: Promise<{ id: string }>
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

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">

          {/* Hero — full width */}
          <div className="lg:col-span-5 rounded-2xl border bg-gradient-to-br from-card via-card to-accent/30 p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
              <Avatar className="size-20 shrink-0 ring-4 ring-border">
                <AvatarImage
                  src={profile.avatar_url ?? undefined}
                  alt={profile.display_name}
                />
                <AvatarFallback className="text-2xl">
                  {getInitials(profile.display_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight">
                    {profile.display_name}
                  </h1>
                  <PresenceStatus userId={profile.id} />
                </div>

                {profile.hourly_rate != null && (
                  <p className="text-base text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      ${profile.hourly_rate}
                    </span>
                    /hr
                  </p>
                )}

                {profile.roles && profile.roles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profile.roles.map((role: string) => (
                      <Badge
                        key={role}
                        variant="secondary"
                        className="text-sm"
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Left column — Portfolio */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Portfolio
            </p>
            <PortfolioGallery items={portfolioItems ?? []} />
          </div>

          {/* Right column — About + Rating + CTA */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Rating Summary */}
            <RatingSummary avgRating={avgRating} totalCount={totalReviews} />

            {/* About */}
            <div className="rounded-2xl border bg-card p-6">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                About
              </h2>
              {profile.bio ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {profile.bio}
                </p>
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
            <div className="rounded-2xl border bg-card p-6">
              <h2 className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Work Together
              </h2>
              {profile.hourly_rate != null && (
                <p className="mb-5 text-sm text-muted-foreground">
                  Starting at{" "}
                  <span className="font-semibold text-foreground">
                    ${profile.hourly_rate}/hr
                  </span>
                </p>
              )}
              <GlowButton
                talentId={profile.id}
                talentName={profile.display_name}
              />
            </div>
          </div>

          {/* Testimonials — full width below */}
          {reviewList.length > 0 && (
            <div className="lg:col-span-5">
              <TestimonialsList reviews={reviewList} />
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
