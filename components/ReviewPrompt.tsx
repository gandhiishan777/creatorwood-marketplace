"use client"

import { useActionState, useState } from "react"
import { Star, CheckCircle2 } from "lucide-react"
import { submitReview } from "@/app/actions/review"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface ReviewPromptProps {
  connectionId: string
  otherName: string
}

const initialState = { error: null as string | null, success: false }

function StarRating({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex gap-1" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered || value)
        return (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onClick={() => onChange(star)}
            className="rounded-sm p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Star
              className={`size-7 transition-colors ${
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-muted-foreground/30"
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}

export function ReviewPrompt({ connectionId, otherName }: ReviewPromptProps) {
  const [state, formAction, isPending] = useActionState(submitReview, initialState)
  const [rating, setRating] = useState(0)

  if (state.success) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
        <div>
          <p className="text-sm font-medium">Thanks for your review!</p>
          <p className="text-xs text-muted-foreground">
            Your feedback helps the community.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="mb-1 text-sm font-semibold">
        How was working with {otherName}?
      </p>
      <p className="mb-4 text-xs text-muted-foreground">
        Leave a rating to help other clients and creators.
      </p>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="connection_id" value={connectionId} />
        <input type="hidden" name="rating" value={rating} />

        <StarRating value={rating} onChange={setRating} />

        <Textarea
          name="comment"
          placeholder="Any additional thoughts? (optional)"
          rows={2}
          className="resize-none"
        />

        {state.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}

        <Button type="submit" size="sm" disabled={isPending || rating === 0} className="self-start">
          {isPending ? "Submitting..." : "Submit Review"}
        </Button>
      </form>
    </div>
  )
}
