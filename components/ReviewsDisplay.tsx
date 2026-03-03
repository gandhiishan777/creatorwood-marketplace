"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getInitials } from "@/lib/utils"

interface Review {
  id: string
  rating: number
  comment: string | null
  created_at: string | null
  reviewer: {
    display_name: string
    avatar_url: string | null
  }
}

interface ReviewsDisplayProps {
  reviews: Review[]
  avgRating: number | null
  totalCount: number
}

function StarRow({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sizeClass = size === "md" ? "size-5" : "size-3.5"
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${sizeClass} ${
            s <= rating
              ? "fill-amber-400 text-amber-400"
              : s - 0.5 <= rating
                ? "fill-amber-400/50 text-amber-400"
                : "fill-transparent text-muted-foreground/20"
          }`}
        />
      ))}
    </div>
  )
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ""
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const seconds = Math.floor((now - then) / 1000)

  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="flex gap-3 border-l-2 border-amber-400/30 pl-4 py-2">
      <Avatar className="size-8 shrink-0">
        <AvatarImage
          src={review.reviewer.avatar_url ?? undefined}
          alt={review.reviewer.display_name}
        />
        <AvatarFallback className="text-xs">
          {getInitials(review.reviewer.display_name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{review.reviewer.display_name}</p>
          <span className="text-xs text-muted-foreground">
            {timeAgo(review.created_at)}
          </span>
        </div>
        <StarRow rating={review.rating} />
        {review.comment && (
          <p className="mt-1.5 text-sm text-foreground/80 leading-relaxed">
            {review.comment}
          </p>
        )}
      </div>
    </div>
  )
}

export function RatingSummary({
  avgRating,
  totalCount,
}: {
  avgRating: number | null
  totalCount: number
}) {
  if (totalCount === 0 || avgRating == null) {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Reviews
        </h2>
        <p className="text-sm text-muted-foreground italic">No reviews yet</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-card p-6">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Reviews
      </h2>
      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold">{avgRating}</span>
        <div className="flex flex-col gap-0.5">
          <StarRow rating={Math.round(avgRating)} size="md" />
          <span className="text-xs text-muted-foreground">
            {totalCount} {totalCount === 1 ? "review" : "reviews"}
          </span>
        </div>
      </div>
    </div>
  )
}

export function TestimonialsList({ reviews }: { reviews: Review[] }) {
  const [showAll, setShowAll] = useState(false)

  if (reviews.length === 0) return null

  const visible = showAll ? reviews : reviews.slice(0, 3)

  return (
    <div className="rounded-2xl border bg-card p-6">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        What Clients Say
      </h2>
      <div className="flex flex-col gap-4">
        {visible.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
      {reviews.length > 3 && !showAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(true)}
          className="mt-3"
        >
          Show all {reviews.length} reviews
        </Button>
      )}
    </div>
  )
}
