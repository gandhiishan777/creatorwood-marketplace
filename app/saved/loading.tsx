function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="aspect-video animate-shimmer" />
      <div className="px-4 pb-4">
        <div className="-mt-6 mb-3">
          <div className="size-12 animate-shimmer rounded-full ring-2 ring-background" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="h-4 w-32 animate-shimmer rounded" />
          <div className="h-3 w-20 animate-shimmer rounded" />
          <div className="flex gap-1.5">
            <div className="h-5 w-16 animate-shimmer rounded-full" />
            <div className="h-5 w-14 animate-shimmer rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SavedLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="h-8 w-44 animate-shimmer rounded" />
          <div className="mt-3 h-4 w-56 animate-shimmer rounded" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  )
}
