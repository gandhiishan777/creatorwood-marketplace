"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, Star } from "lucide-react"
import { MOTION } from "@/lib/motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PresenceIndicator } from "@/components/PresenceIndicator"
import { SaveButton } from "@/components/SaveButton"
import { getInitials } from "@/lib/utils"

export interface TalentCardProfile {
  id: string
  display_name: string
  avatar_url: string | null
  roles: string[] | null
  hourly_rate: number | null
  portfolio_thumbnails: string[]
  avg_rating: number | null
  review_count: number
  isSaved?: boolean
}

interface TalentCardProps extends TalentCardProfile {
  featured?: boolean
}

function ThumbnailCycler({
  thumbnails,
  displayName,
}: {
  thumbnails: string[]
  displayName: string
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startCycling = useCallback(() => {
    if (thumbnails.length <= 1) return
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % thumbnails.length)
    }, 1500)
  }, [thumbnails.length])

  const stopCycling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setActiveIndex(0)
  }, [])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  if (thumbnails.length === 0) {
    return (
      <div className="flex size-full items-center justify-center bg-gradient-to-br from-accent via-muted to-accent/60">
        <span className="text-3xl font-bold text-muted-foreground/30 select-none">
          {getInitials(displayName)}
        </span>
      </div>
    )
  }

  return (
    <div
      className="relative size-full"
      onMouseEnter={() => {
        setIsHovering(true)
        startCycling()
      }}
      onMouseLeave={() => {
        setIsHovering(false)
        stopCycling()
      }}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={thumbnails[activeIndex]}
          src={thumbnails[activeIndex]}
          alt={`${displayName}'s work`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="size-full object-cover"
        />
      </AnimatePresence>

      {/* Dot indicators */}
      {thumbnails.length > 1 && (
        <div className="absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {thumbnails.map((_, i) => (
            <span
              key={i}
              className={`size-1.5 rounded-full transition-all duration-200 ${
                i === activeIndex
                  ? "bg-white scale-125"
                  : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}

      {/* Frosted glass "View Profile" bar — slides up on hover */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between border-t border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur-md transition-transform duration-300 ${
          isHovering ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <span className="text-xs font-semibold text-white">View Profile</span>
        <ArrowRight className="size-3.5 text-white" />
      </div>

      {/* Bottom gradient for avatar overlap */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card/80 to-transparent" />
    </div>
  )
}

export function TalentCard({
  id,
  display_name,
  avatar_url,
  roles,
  hourly_rate,
  portfolio_thumbnails,
  avg_rating,
  review_count,
  isSaved = false,
  featured = false,
}: TalentCardProps) {
  return (
    <Link href={`/profile/${id}`} className="group block">
      <motion.div
        whileHover={{ y: -4 }}
        transition={MOTION.spring}
        className="relative overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-shadow duration-300 hover:shadow-lg"
      >
        {/* Stacking card illusion */}
        <div className="pointer-events-none absolute -bottom-1.5 left-2 right-2 -z-10 h-4 rounded-b-xl border border-border/30 bg-card/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Portfolio Thumbnail */}
        <div className={`relative overflow-hidden bg-muted ${featured ? "aspect-[4/3]" : "aspect-video"}`}>
          <ThumbnailCycler
            thumbnails={portfolio_thumbnails}
            displayName={display_name}
          />

          {/* Save button — top right */}
          <div className="absolute right-2.5 top-2.5 z-20 opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:opacity-0 max-sm:opacity-100">
            <SaveButton creatorId={id} initialSaved={isSaved} size="sm" />
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
                <p className="truncate font-display text-lg leading-tight">
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
