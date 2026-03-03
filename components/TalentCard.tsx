"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PresenceIndicator } from "@/components/PresenceIndicator"
import { getInitials } from "@/lib/utils"

export interface TalentCardProfile {
  id: string
  display_name: string
  avatar_url: string | null
  roles: string[] | null
  hourly_rate: number | null
  bio: string | null
  portfolio_thumbnail: string | null
  avg_rating: number | null
  review_count: number
}

interface TalentCardProps extends TalentCardProfile {
  featured?: boolean
}

export function TalentCard({
  id,
  display_name,
  avatar_url,
  roles,
  hourly_rate,
  portfolio_thumbnail,
  avg_rating,
  review_count,
  featured = false,
}: TalentCardProps) {
  return (
    <Link href={`/profile/${id}`} className="group block">
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-shadow hover:shadow-xl hover:shadow-primary/5"
      >
        {/* Portfolio Thumbnail */}
        <div className={`relative overflow-hidden bg-muted ${featured ? "aspect-[4/3]" : "aspect-video"}`}>
          {portfolio_thumbnail ? (
            <img
              src={portfolio_thumbnail}
              alt={`${display_name}'s work`}
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-gradient-to-br from-accent via-muted to-accent/60">
              <span className="text-3xl font-bold text-muted-foreground/30 select-none">
                {getInitials(display_name)}
              </span>
            </div>
          )}
          {/* Bottom gradient for avatar overlap */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card/80 to-transparent" />

          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/10">
            <span className="rounded-full bg-white/90 px-4 py-1.5 text-xs font-semibold text-black opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100 dark:bg-white/90 dark:text-black">
              View Profile
            </span>
          </div>
        </div>

        {/* Identity */}
        <div className="px-4 pb-4">
          <div className="-mt-6 mb-3">
            <div className="relative inline-flex">
              <Avatar className="size-12 ring-2 ring-background">
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
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-semibold leading-tight">
                  {display_name}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {hourly_rate != null ? `$${hourly_rate}/hr` : "Rate negotiable"}
                </p>
              </div>
              {avg_rating != null && review_count > 0 && (
                <div className="flex shrink-0 items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5">
                  <Star className="size-3 fill-amber-500 text-amber-500" />
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                    {avg_rating}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({review_count})
                  </span>
                </div>
              )}
            </div>

            {roles && roles.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {roles.slice(0, 3).map((role: string) => (
                  <Badge
                    key={role}
                    variant="secondary"
                    className="text-xs"
                  >
                    {role}
                  </Badge>
                ))}
                {roles.length > 3 && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
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
