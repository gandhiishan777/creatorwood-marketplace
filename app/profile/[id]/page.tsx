import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/utils/supabase/server"
import { GlowButton } from "@/components/ProfileHero"
import { CinematicHero } from "@/components/CinematicHero"
import { PortfolioGallery } from "@/components/PortfolioGallery"
import { TestimonialsList } from "@/components/ReviewsDisplay"
import { AnimateOnScroll } from "@/components/AnimateOnScroll"
import { getSavedCreatorIds } from "@/app/actions/saved"

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
    reviewer: { display_name: string; avatar_url: string | null } | null
  }>
  const totalReviews = reviewList.length
  const avgRating =
    totalReviews > 0
      ? Math.round(
          (reviewList.reduce((sum, r) => sum + r.rating, 0) / totalReviews) *
            10
        ) / 10
      : null

  const heroImage =
    (portfolioItems ?? []).find((item) => item.thumbnail_url)?.thumbnail_url ??
    null
  const tagline = extractTagline(profile.bio)

  return (
    <div className="min-h-screen bg-[#131315]">
      {/* Fixed atmospheric background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        {/* Violet glow blob — top-left */}
        <div
          className="absolute -top-64 -left-32 h-[600px] w-[600px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        {/* Indigo glow blob — bottom-right */}
        <div
          className="absolute -bottom-64 -right-32 h-[500px] w-[500px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #6366f1 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* Cinematic Hero */}
      <div className="relative z-10">
        <CinematicHero
          displayName={profile.display_name}
          roles={profile.roles ?? undefined}
          heroImage={heroImage}
          avatarUrl={profile.avatar_url ?? null}
          userId={profile.id}
          isSaved={isSaved}
          isAuthenticated={!!user}
          hourlyRate={profile.hourly_rate ?? null}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {tagline && (
          <AnimateOnScroll className="mb-10">
            <blockquote className="border-l-4 border-[#8B5CF6]/40 pl-5">
              <p className="font-display text-2xl italic tracking-tight text-white/70">
                {tagline}
              </p>
            </blockquote>
          </AnimateOnScroll>
        )}

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left column — portfolio (2/3) */}
          <AnimateOnScroll delay={0.05} className="flex flex-col gap-4 lg:w-2/3">
            <h2 className="font-display text-xl tracking-tight text-white">
              Portfolio
            </h2>
            <PortfolioGallery
              items={portfolioItems ?? []}
              creatorName={profile.display_name}
            />
          </AnimateOnScroll>

          {/* Right column — about + CTA (1/3) */}
          <div className="flex flex-col gap-6 lg:w-1/3">
            {/* Reviews summary panel */}
            <AnimateOnScroll delay={0.1}>
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <h2 className="mb-3 font-display text-xl tracking-tight text-white">
                  Reviews
                </h2>
                {totalReviews === 0 || avgRating == null ? (
                  <p className="text-sm text-white/40 italic">No reviews yet</p>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-white">
                      {avgRating}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <svg
                            key={s}
                            className={`size-4 ${
                              s <= Math.round(avgRating)
                                ? "text-amber-400"
                                : "text-white/20"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-white/50">
                        {totalReviews}{" "}
                        {totalReviews === 1 ? "review" : "reviews"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </AnimateOnScroll>

            {/* About panel */}
            <AnimateOnScroll delay={0.15}>
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <h2 className="mb-4 font-display text-xl tracking-tight text-white">
                  About
                </h2>
                {profile.bio ? (
                  <div className="border-l-2 border-[#8B5CF6]/30 pl-4">
                    <p className="whitespace-pre-wrap text-base leading-relaxed text-white/70">
                      {profile.bio}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-white/40 italic">
                    This creator hasn&apos;t added a bio yet.
                  </p>
                )}
                {profile.roles && profile.roles.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {profile.roles.map((role: string) => (
                      <Badge
                        key={role}
                        variant="outline"
                        className="border-white/10 text-white/50"
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </AnimateOnScroll>

            {/* CTA panel */}
            <AnimateOnScroll delay={0.2}>
              <div
                className="rounded-2xl py-8 px-6"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <h2 className="mb-1 font-display text-lg tracking-tight text-white">
                  Like what you see?
                </h2>
                {profile.hourly_rate != null ? (
                  <p className="mb-5 text-sm text-white/50">
                    Starting at{" "}
                    <span className="font-semibold text-white">
                      ${profile.hourly_rate}/hr
                    </span>
                  </p>
                ) : (
                  <p className="mb-5 text-sm text-white/50">
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
          </div>
        </div>

        {/* Testimonials — full width below both columns */}
        {reviewList.length > 0 && (
          <AnimateOnScroll delay={0.15} className="mt-8">
            <TestimonialsList reviews={reviewList} />
          </AnimateOnScroll>
        )}
      </div>
    </div>
  )
}
