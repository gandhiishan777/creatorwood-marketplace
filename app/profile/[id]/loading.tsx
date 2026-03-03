export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero skeleton */}
      <div className="relative h-[55vh] min-h-[400px] w-full animate-shimmer">
        <div className="absolute inset-x-0 bottom-0 hero-gradient">
          <div className="mx-auto max-w-6xl px-4 pb-8 sm:px-6 lg:px-8">
            <div className="flex items-end gap-6">
              <div className="size-28 shrink-0 animate-shimmer rounded-full ring-4 ring-white/20" />
              <div className="flex flex-col gap-3 pb-1">
                <div className="h-10 w-64 animate-shimmer rounded" />
                <div className="flex gap-3">
                  <div className="h-5 w-20 animate-shimmer rounded" />
                  <div className="h-5 w-16 animate-shimmer rounded-full" />
                  <div className="h-5 w-16 animate-shimmer rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Portfolio column */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="h-6 w-24 animate-shimmer rounded" />
            <div className="aspect-[16/10] w-full animate-shimmer rounded-2xl" />
            <div className="grid grid-cols-2 gap-3">
              <div className="aspect-square animate-shimmer rounded-xl" />
              <div className="aspect-square animate-shimmer rounded-xl" />
            </div>
          </div>

          {/* Sidebar column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="h-32 animate-shimmer rounded-2xl border" />
            <div className="h-48 animate-shimmer rounded-2xl border" />
            <div className="h-36 animate-shimmer rounded-2xl border" />
          </div>
        </div>
      </div>
    </div>
  )
}
