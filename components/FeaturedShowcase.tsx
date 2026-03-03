import Link from "next/link"

interface ShowcaseItem {
  thumbnail_url: string | null
  title: string | null
  profile_id: string
  profiles: {
    display_name: string
    avatar_url: string | null
  }
}

interface FeaturedShowcaseProps {
  items: ShowcaseItem[]
}

export function FeaturedShowcase({ items }: FeaturedShowcaseProps) {
  if (items.length === 0) return null

  // Bento layout: first item large, rest fill a 2-col grid
  const [hero, ...rest] = items

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:grid-rows-2">
      {/* Large hero thumbnail */}
      <Link
        href={`/profile/${hero.profile_id}`}
        className="group relative col-span-2 row-span-2 overflow-hidden rounded-2xl"
      >
        {hero.thumbnail_url ? (
          <img
            src={hero.thumbnail_url}
            alt={hero.title ?? "Creator work"}
            className="size-full aspect-square sm:aspect-auto object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="size-full aspect-square sm:aspect-auto bg-gradient-to-br from-indigo-500/20 to-violet-500/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 transition-opacity" />
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-sm font-medium text-white/90">
            {hero.profiles.display_name}
          </p>
          {hero.title && (
            <p className="mt-0.5 text-xs text-white/60">{hero.title}</p>
          )}
        </div>
      </Link>

      {/* Smaller thumbnails */}
      {rest.slice(0, 4).map((item, i) => (
        <Link
          key={`${item.profile_id}-${i}`}
          href={`/profile/${item.profile_id}`}
          className="group relative overflow-hidden rounded-xl aspect-square"
        >
          {item.thumbnail_url ? (
            <img
              src={item.thumbnail_url}
              alt={item.title ?? "Creator work"}
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="size-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <p className="absolute bottom-2 left-2 right-2 truncate text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
            {item.profiles.display_name}
          </p>
        </Link>
      ))}
    </div>
  )
}
