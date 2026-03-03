import { notFound } from "next/navigation"
import { Play } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/utils/supabase/server"
import { GlowButton, PresenceStatus } from "@/components/ProfileHero"

interface ProfilePageProps {
  params: Promise<{ id: string }>
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single()

  if (!profile) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-5">

          {/* Block 1 — Hero (full width) */}
          <div className="col-span-2 rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
              <Avatar size="lg" className="size-20 shrink-0 ring-4 ring-white/10">
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
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
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
                        className="border border-white/10 text-sm"
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Block 2 — Featured Reel (left col, spans 2 rows) */}
          <div className="row-span-2 flex flex-col gap-3">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-800 to-zinc-900">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-transform duration-200 hover:scale-110 cursor-pointer">
                  <Play className="size-7 fill-white/80 text-white/80 translate-x-0.5" />
                </div>
              </div>
              {/* Film grain texture overlay */}
              <div className="absolute inset-0 opacity-5 mix-blend-overlay bg-[radial-gradient(circle,_white_1px,_transparent_1px)] bg-[length:4px_4px]" />
            </div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground text-center">
              Featured Reel
            </p>
          </div>

          {/* Block 3 — About & Tools (right col, row 2) */}
          <div className="rounded-2xl border border-white/10 bg-card p-6">
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
                    className="border-white/15 text-muted-foreground"
                  >
                    {role}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Block 4 — Action (right col, row 3) */}
          <div className="rounded-2xl border border-white/10 bg-card p-6">
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
      </div>
    </div>
  )
}
