"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Play } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PresenceIndicator } from "@/components/PresenceIndicator"
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
}: TalentCardProps) {
  return (
    <Link href={`/profile/${id}`} className="group block">
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="overflow-hidden rounded-xl border border-white/10 bg-card shadow-sm hover:shadow-xl hover:shadow-primary/5"
      >
        {/* Portfolio Thumbnail */}
        <div className="relative aspect-video bg-gradient-to-br from-zinc-800 to-zinc-900">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-transform duration-200 group-hover:scale-110">
              <Play className="size-5 fill-white/80 text-white/80 translate-x-0.5" />
            </div>
          </div>
          {/* Subtle gradient overlay at the bottom for the avatar overlap */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card/80 to-transparent" />
        </div>

        {/* Identity */}
        <div className="px-4 pb-4">
          {/* Avatar overlapping the thumbnail with presence indicator */}
          <div className="-mt-6 mb-3">
            <div className="relative inline-flex">
              <Avatar
                size="lg"
                className="size-12 ring-2 ring-background"
              >
                <AvatarImage src={avatar_url ?? undefined} alt={display_name} />
                <AvatarFallback className="text-sm">
                  {getInitials(display_name)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5">
                <PresenceIndicator userId={id} size="sm" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div>
              <p className="truncate font-semibold leading-tight">
                {display_name}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {hourly_rate != null ? `$${hourly_rate}/hr` : "Rate negotiable"}
              </p>
            </div>

            {roles && roles.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {roles.slice(0, 3).map((role: string) => (
                  <Badge
                    key={role}
                    variant="secondary"
                    className="text-xs border border-white/10"
                  >
                    {role}
                  </Badge>
                ))}
                {roles.length > 3 && (
                  <Badge variant="outline" className="text-xs border-white/10 text-muted-foreground">
                    +{roles.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
