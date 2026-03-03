import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { Separator } from "@/components/ui/separator";
import { PageContainer } from "@/components/PageContainer";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";
import { ProfileForm } from "./profile-form";
import { PortfolioManager } from "./portfolio-manager";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: portfolioItems }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("portfolio_items")
      .select("*")
      .eq("profile_id", user.id)
      .order("sort_order", { ascending: true }),
  ]);

  const { onboarding } = await searchParams;

  return (
    <main className="min-h-screen bg-background">
      <PageContainer maxWidth="sm" className="py-16">
        {onboarding && (
          <div className="mb-8 flex items-center gap-3 rounded-xl border border-brand/30 bg-brand-muted p-4">
            <Sparkles className="size-5 shrink-0 text-brand" />
            <div>
              <p className="text-sm font-semibold">Welcome to Creatorwood</p>
              <p className="text-xs text-muted-foreground">
                Set up your profile to get started. Tell the community who you
                are and what you do.
              </p>
            </div>
          </div>
        )}

        <AnimateOnScroll className="mb-8">
          <h1 className="font-display text-3xl tracking-tight">
            {onboarding ? "Create Your Profile" : "Setup Your Profile"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tell the community who you are and what you do.
          </p>
        </AnimateOnScroll>
        <ProfileForm profile={profile} userId={user.id} />

        <Separator className="my-10" />

        {profile?.is_discoverable ? (
          <PortfolioManager items={portfolioItems ?? []} />
        ) : (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <h2 className="text-lg font-semibold tracking-tight">Portfolio</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your portfolio will be visible to clients once you&apos;re available
              for hire. Toggle &ldquo;Available for Hire&rdquo; above and save your
              profile to start adding work.
            </p>
          </div>
        )}
      </PageContainer>
    </main>
  );
}
