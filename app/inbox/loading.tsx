function SkeletonCard() {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
      <div className="size-10 shrink-0 animate-shimmer rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-48 animate-shimmer rounded" />
        <div className="h-3 w-32 animate-shimmer rounded" />
      </div>
      <div className="h-5 w-16 animate-shimmer rounded-full" />
    </div>
  )
}

export default function InboxLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="h-8 w-24 animate-shimmer rounded" />
          <div className="mt-3 h-4 w-64 animate-shimmer rounded" />
        </div>

        {/* Tabs skeleton */}
        <div className="mb-4 flex gap-2">
          <div className="h-9 w-24 animate-shimmer rounded-lg" />
          <div className="h-9 w-20 animate-shimmer rounded-lg" />
          <div className="h-9 w-16 animate-shimmer rounded-lg" />
        </div>

        <div className="flex flex-col gap-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  )
}
