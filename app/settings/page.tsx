import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { Separator } from "@/components/ui/separator";
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
      <div className="mx-auto max-w-xl px-4 py-16">
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

        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            {onboarding ? "Create Your Profile" : "Setup Your Profile"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tell the community who you are and what you do.
          </p>
        </div>
        <ProfileForm profile={profile} userId={user.id} />

        <Separator className="my-10" />

        <PortfolioManager items={portfolioItems ?? []} />
      </div>
    </main>
  );
}
