import Link from "next/link"
import { ArrowRight, Users, Briefcase, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FeaturedShowcase } from "@/components/FeaturedShowcase"
import { FeaturedCreators } from "@/components/FeaturedCreators"
import { createClient } from "@/utils/supabase/server"

export default async function LandingPage() {
  const supabase = await createClient()

  // Fetch featured portfolio items with creator info
  const { data: showcaseItems } = await supabase
    .from("portfolio_items")
    .select(
      "thumbnail_url, title, profile_id, profiles!inner(display_name, avatar_url)"
    )
    .order("created_at", { ascending: false })
    .limit(6)

  // Fetch featured creators (discoverable, with first portfolio thumbnail)
  const { data: creatorsRaw } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, roles")
    .eq("is_discoverable", true)
    .order("created_at", { ascending: false })
    .limit(8)

  let creatorThumbnails = new Map<string, string>()
  if (creatorsRaw && creatorsRaw.length > 0) {
    const { data: portfolioItems } = await supabase
      .from("portfolio_items")
      .select("profile_id, thumbnail_url")
      .in(
        "profile_id",
        creatorsRaw.map((c) => c.id)
      )
      .order("sort_order", { ascending: true })

    if (portfolioItems) {
      for (const item of portfolioItems) {
        if (!creatorThumbnails.has(item.profile_id) && item.thumbnail_url) {
          creatorThumbnails.set(item.profile_id, item.thumbnail_url)
        }
      }
    }
  }

  const featuredCreators = (creatorsRaw ?? []).map((c) => ({
    ...c,
    portfolio_thumbnail: creatorThumbnails.get(c.id) ?? null,
  }))

  // Real stats
  const [{ count: creatorCount }, { count: projectCount }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_discoverable", true),
    supabase
      .from("connections")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed"),
  ])

  const hasShowcase = showcaseItems && showcaseItems.length > 0
  const hasCreators = featuredCreators.length > 0

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-20 sm:py-28">
        {/* Background */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(139,92,246,0.10) 0%, transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-20 dark:opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            color: "oklch(0.5 0 0)",
          }}
        />

        <div className="mx-auto max-w-7xl">
          <div className={`grid items-center gap-12 ${hasShowcase ? "lg:grid-cols-2" : ""}`}>
            {/* Left: Copy */}
            <div className={`${hasShowcase ? "" : "mx-auto max-w-3xl text-center"}`}>
              <div className="mb-6 inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-400 backdrop-blur-sm">
                The AI Creator Marketplace
              </div>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Hire the World&apos;s{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                  Best AI Creators
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                Connect with top-tier talent building the AI-powered future.
                Discover portfolios, read reviews, and collaborate with creators
                who move at the speed of innovation.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="h-12 px-8 bg-indigo-600 hover:bg-indigo-500 text-white text-base font-semibold shadow-lg shadow-indigo-900/40"
                  asChild
                >
                  <Link href="/discover">
                    Find Talent
                    <ArrowRight className="ml-1.5 size-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-base font-semibold"
                  asChild
                >
                  <Link href="/login">Join as a Creator</Link>
                </Button>
              </div>
            </div>

            {/* Right: Portfolio Showcase */}
            {hasShowcase && (
              <div className="hidden lg:block">
                <FeaturedShowcase
                  items={
                    (showcaseItems as unknown as Array<{
                      thumbnail_url: string | null
                      title: string | null
                      profile_id: string
                      profiles: {
                        display_name: string
                        avatar_url: string | null
                      }
                    }>) ?? []
                  }
                />
              </div>
            )}
          </div>

          {/* Mobile showcase — below hero on small screens */}
          {hasShowcase && (
            <div className="mt-12 lg:hidden">
              <FeaturedShowcase
                items={
                  (showcaseItems as unknown as Array<{
                    thumbnail_url: string | null
                    title: string | null
                    profile_id: string
                    profiles: {
                      display_name: string
                      avatar_url: string | null
                    }
                  }>) ?? []
                }
              />
            </div>
          )}
        </div>
      </section>

      {/* Featured Creators */}
      {hasCreators && (
        <section className="px-4 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
                  Featured Creators
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                  Meet the talent
                </h2>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/discover">
                  View all
                  <ArrowRight className="ml-1 size-3.5" />
                </Link>
              </Button>
            </div>
            <FeaturedCreators creators={featuredCreators} />
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="border-y px-4 py-14">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <Users className="mb-2 size-5 text-indigo-400" />
              <p className="text-3xl font-bold">{creatorCount ?? 0}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {(creatorCount ?? 0) === 1 ? "Creator" : "Creators"}
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Briefcase className="mb-2 size-5 text-indigo-400" />
              <p className="text-3xl font-bold">{projectCount ?? 0}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {(projectCount ?? 0) === 1 ? "Project Completed" : "Projects Completed"}
              </p>
            </div>
            <div className="col-span-2 flex flex-col items-center text-center sm:col-span-1">
              <Star className="mb-2 size-5 text-indigo-400" />
              <p className="text-3xl font-bold">Direct</p>
              <p className="mt-1 text-sm text-muted-foreground">
                No middlemen, no delays
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to find your next collaborator?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Browse portfolios, read reviews, and connect directly with creators who get it done.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="h-12 px-8 bg-indigo-600 hover:bg-indigo-500 text-white text-base font-semibold shadow-lg shadow-indigo-900/40"
              asChild
            >
              <Link href="/discover">Browse Creators</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base font-semibold" asChild>
              <Link href="/login">Create Your Profile</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-sm font-semibold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Creatorwood
          </span>
          <p className="text-xs text-muted-foreground">
            &copy; 2026 Creatorwood. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
