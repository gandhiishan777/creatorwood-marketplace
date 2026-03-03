export default function SettingsLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="mb-8">
          <div className="h-8 w-52 animate-shimmer rounded" />
          <div className="mt-3 h-4 w-72 animate-shimmer rounded" />
        </div>

        <div className="flex flex-col gap-6">
          {/* Avatar skeleton */}
          <div className="flex items-center gap-4">
            <div className="size-20 animate-shimmer rounded-full" />
            <div className="space-y-2">
              <div className="h-4 w-24 animate-shimmer rounded" />
              <div className="h-3 w-36 animate-shimmer rounded" />
            </div>
          </div>

          {/* Input fields */}
          <div className="space-y-2">
            <div className="h-4 w-28 animate-shimmer rounded" />
            <div className="h-9 w-full animate-shimmer rounded-md" />
          </div>

          {/* Toggle */}
          <div className="h-16 w-full animate-shimmer rounded-lg border" />

          {/* Conditional fields */}
          <div className="flex flex-col gap-5 rounded-lg border p-4">
            <div className="space-y-2">
              <div className="h-4 w-16 animate-shimmer rounded" />
              <div className="h-9 w-full animate-shimmer rounded-md" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-28 animate-shimmer rounded" />
              <div className="h-9 w-full animate-shimmer rounded-md" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-10 animate-shimmer rounded" />
              <div className="h-24 w-full animate-shimmer rounded-md" />
            </div>
          </div>

          <div className="h-9 w-28 animate-shimmer rounded-md" />
        </div>
      </div>
    </main>
  )
}
