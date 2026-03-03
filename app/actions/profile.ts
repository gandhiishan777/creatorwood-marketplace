"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { TablesInsert } from "@/types/supabase";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const rolesRaw = formData.get("roles") as string | null;
  const roles = rolesRaw
    ? rolesRaw
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean)
    : [];

  const hourlyRateRaw = formData.get("hourly_rate") as string | null;
  const hourly_rate = hourlyRateRaw ? parseFloat(hourlyRateRaw) : null;

  const avatarUrl = (formData.get("avatar_url") as string) || null;

  const displayName = (formData.get("display_name") as string) ?? "";

  const payload: TablesInsert<"profiles"> = {
    id: user.id,
    display_name: displayName,
    bio: (formData.get("bio") as string) || null,
    hourly_rate: isNaN(hourly_rate as number) ? null : hourly_rate,
    roles: roles.length > 0 ? roles : null,
    is_discoverable: formData.get("is_discoverable") === "true",
    avatar_url: avatarUrl,
  };

  const { error } = await supabase.from("profiles").upsert(payload, {
    onConflict: "id",
  });

  if (error) {
    return { error: error.message };
  }

  if (displayName && displayName !== "New User") {
    const cookieStore = await cookies();
    cookieStore.set("cw_profile_complete", "1", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  revalidatePath("/settings");
  revalidatePath("/", "layout");
  return { error: null };
}
