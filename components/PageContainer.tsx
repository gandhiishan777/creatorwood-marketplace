import { cn } from "@/lib/utils"

const MAX_WIDTH = {
  sm: "max-w-xl",
  md: "max-w-3xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
} as const

interface PageContainerProps {
  children: React.ReactNode
  maxWidth?: keyof typeof MAX_WIDTH
  className?: string
}

export function PageContainer({
  children,
  maxWidth = "xl",
  className,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto px-4 py-10 sm:px-6 lg:px-8",
        MAX_WIDTH[maxWidth],
        className,
      )}
    >
      {children}
    </div>
  )
}
