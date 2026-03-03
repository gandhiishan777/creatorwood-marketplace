import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { HireModal } from "@/components/HireModal"
import { createClient } from "@/utils/supabase/server"

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
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 gap-8 items-start">
          {/* Col 1: Identity */}
          <div className="col-span-1 flex flex-col gap-5">
            <div className="flex flex-col items-center gap-4 text-center">
              <Avatar size="lg" className="size-24">
                <AvatarImage
                  src={profile.avatar_url ?? undefined}
                  alt={profile.display_name}
                />
                <AvatarFallback className="text-2xl">
                  {getInitials(profile.display_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">
                  {profile.display_name}
                </h1>
                {profile.hourly_rate != null && (
                  <p className="text-sm font-medium text-muted-foreground">
                    ${profile.hourly_rate}/hr
                  </p>
                )}
              </div>
            </div>

            {profile.roles && profile.roles.length > 0 && (
              <>
                <Separator />
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Roles
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.roles.map((role) => (
                      <Badge key={role} variant="secondary">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Col 2: Bio */}
          <div className="col-span-1">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              About
            </h2>
            {profile.bio ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {profile.bio}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                This creator hasn&apos;t added a bio yet.
              </p>
            )}
          </div>

          {/* Col 3: Hire sidebar */}
          <div className="col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-base">Work with {profile.display_name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {profile.hourly_rate != null && (
                  <p className="text-sm text-muted-foreground">
                    Starting at{" "}
                    <span className="font-semibold text-foreground">
                      ${profile.hourly_rate}/hr
                    </span>
                  </p>
                )}
                <HireModal
                  talentId={profile.id}
                  talentName={profile.display_name}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
