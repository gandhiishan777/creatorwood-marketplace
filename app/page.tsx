import Link from "next/link";
import { Search, MessageCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Search,
    step: "01",
    title: "Discover",
    description:
      "Browse a curated marketplace of top-tier AI creators — from prompt engineers and video producers to automation specialists and generative artists.",
  },
  {
    icon: MessageCircle,
    step: "02",
    title: "Connect",
    description:
      "Review portfolios, check availability, and reach out instantly. No middlemen, no delays — just a direct line to the talent you need.",
  },
  {
    icon: Zap,
    step: "03",
    title: "Collaborate",
    description:
      "Work together in real-time through our built-in messaging and project tools. Ship faster with creators who speak your language.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-32 text-center">
        {/* Background radial gradient */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.18) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(139,92,246,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Dot pattern */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-30 dark:opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            color: "oklch(0.5 0 0)",
          }}
        />

        <div className="mx-auto max-w-4xl space-y-6">
          <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-400 backdrop-blur-sm">
            The AI Creator Marketplace
          </div>

          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Hire the World&apos;s{" "}
            <span
              className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent"
            >
              Best AI Creators
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Connect visionaries with the top-tier talent building the AI-powered
            future. Discover, hire, and collaborate with creators who move at the
            speed of innovation.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="h-12 px-8 bg-indigo-600 hover:bg-indigo-500 text-white text-base font-semibold shadow-lg shadow-indigo-900/40"
              asChild
            >
              <Link href="/discover">Find Talent</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 text-base font-semibold"
              asChild
            >
              <Link href="/login">Join as a Creator</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="relative px-4 py-24">
        {/* Subtle dot-pattern background */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-20 dark:opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            color: "oklch(0.5 0 0)",
          }}
        />

        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
              How it works
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              From discovery to delivery
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Three simple steps to go from idea to execution with the right
              creative partner.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            {features.map(({ icon: Icon, step, title, description }) => (
              <div
                key={step}
                className="group relative rounded-2xl border border-border bg-card/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/50 hover:bg-card"
              >
                {/* Step number watermark */}
                <span className="absolute right-6 top-4 text-6xl font-black text-muted/20 select-none">
                  {step}
                </span>

                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 transition-colors group-hover:bg-indigo-500/20">
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="mb-2 text-xl font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-sm font-semibold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Creatorwood
          </span>
          <p className="text-xs text-muted-foreground">
            © 2026 Creatorwood. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
