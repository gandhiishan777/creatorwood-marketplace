import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { Tables } from "@/types/supabase"

type TalentCardProps = Pick<
  Tables<"profiles">,
  "id" | "display_name" | "avatar_url" | "roles" | "hourly_rate" | "bio"
>

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")
}

export function TalentCard({
  id,
  display_name,
  avatar_url,
  roles,
  hourly_rate,
  bio,
}: TalentCardProps) {
  return (
    <Link href={`/profile/${id}`} className="group block">
      <Card className="h-full transition-shadow group-hover:shadow-md">
        <CardHeader className="pb-0">
          <div className="flex items-start gap-3">
            <Avatar size="lg" className="size-12 shrink-0">
              <AvatarImage src={avatar_url ?? undefined} alt={display_name} />
              <AvatarFallback>{getInitials(display_name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold leading-tight">
                {display_name}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {hourly_rate != null ? `$${hourly_rate}/hr` : "Rate negotiable"}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {roles && roles.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {roles.map((role) => (
                <Badge key={role} variant="secondary" className="text-xs">
                  {role}
                </Badge>
              ))}
            </div>
          )}
          {bio && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{bio}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
