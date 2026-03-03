function SkeletonCard({ featured = false }: { featured?: boolean }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className={`animate-pulse bg-muted ${featured ? "aspect-[4/3]" : "aspect-video"}`} />
      <div className="px-4 pb-4">
        <div className="-mt-6 mb-3">
          <div className="size-12 animate-pulse rounded-full bg-muted ring-2 ring-background" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="flex gap-1.5">
            <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
            <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DiscoverLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-4 w-72 animate-pulse rounded bg-muted" />
        </div>

        {/* Search skeleton */}
        <div className="mx-auto mb-8 max-w-2xl">
          <div className="h-3 w-40 animate-pulse rounded bg-muted mb-2" />
          <div className="h-14 w-full animate-pulse rounded-xl bg-muted" />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 items-start">
          {/* Sidebar skeleton */}
          <div className="col-span-1 hidden md:block">
            <div className="h-64 animate-pulse rounded-xl border bg-card shadow-sm" />
          </div>

          {/* Grid skeleton */}
          <div className="col-span-1 md:col-span-3 flex flex-col gap-5">
            {/* Featured row */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <SkeletonCard featured />
              <SkeletonCard featured />
            </div>
            {/* Standard row */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
