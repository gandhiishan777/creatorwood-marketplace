import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getInitials } from "@/lib/utils"

interface FeaturedCreator {
  id: string
  display_name: string
  avatar_url: string | null
  roles: string[] | null
  portfolio_thumbnail: string | null
}

interface FeaturedCreatorsProps {
  creators: FeaturedCreator[]
}

export function FeaturedCreators({ creators }: FeaturedCreatorsProps) {
  if (creators.length === 0) return null

  return (
    <div className="relative">
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-l from-background to-transparent" />

      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-none px-1">
        {creators.map((creator) => (
          <Link
            key={creator.id}
            href={`/profile/${creator.id}`}
            className="group flex-none snap-start"
          >
            <div className="w-56 overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-lg">
              {/* Thumbnail */}
              <div className="relative aspect-[3/2] overflow-hidden bg-muted">
                {creator.portfolio_thumbnail ? (
                  <img
                    src={creator.portfolio_thumbnail}
                    alt={`${creator.display_name}'s work`}
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-gradient-to-br from-accent to-muted">
                    <span className="text-2xl font-bold text-muted-foreground/20 select-none">
                      {getInitials(creator.display_name)}
                    </span>
                  </div>
                )}
              </div>

              {/* Creator info */}
              <div className="flex items-center gap-3 p-3">
                <Avatar className="size-8 shrink-0">
                  <AvatarImage src={creator.avatar_url ?? undefined} alt={creator.display_name} />
                  <AvatarFallback className="text-xs">
                    {getInitials(creator.display_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{creator.display_name}</p>
                  {creator.roles && creator.roles.length > 0 && (
                    <p className="truncate text-xs text-muted-foreground">
                      {creator.roles[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
