import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ProfileForm } from "./profile-form";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            Setup Your Profile
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tell the community who you are and what you do.
          </p>
        </div>
        <ProfileForm profile={profile} userId={user.id} />
      </div>
    </main>
  );
}
