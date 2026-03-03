export default function ChatRoomLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-7 w-56 animate-shimmer rounded" />
              <div className="h-4 w-36 animate-shimmer rounded" />
            </div>
            <div className="h-5 w-16 animate-shimmer rounded-full" />
          </div>
        </div>

        <div className="mb-6 h-px w-full animate-shimmer" />

        {/* Chat skeleton */}
        <div className="h-[500px] rounded-xl border bg-card p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-end gap-2">
              <div className="size-7 shrink-0 animate-shimmer rounded-full" />
              <div className="h-16 w-3/5 animate-shimmer rounded-2xl" />
            </div>
            <div className="flex items-end gap-2 flex-row-reverse">
              <div className="size-7 shrink-0 animate-shimmer rounded-full" />
              <div className="h-10 w-2/5 animate-shimmer rounded-2xl" />
            </div>
            <div className="flex items-end gap-2">
              <div className="size-7 shrink-0 animate-shimmer rounded-full" />
              <div className="h-12 w-1/2 animate-shimmer rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
