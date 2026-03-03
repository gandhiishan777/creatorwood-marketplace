"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"

export async function toggleSaveCreator(
  creatorId: string
): Promise<{ saved: boolean; error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { saved: false, error: "Not authenticated." }
  }

  if (user.id === creatorId) {
    return { saved: false, error: "You cannot save yourself." }
  }

  const { data: existing } = await supabase
    .from("saved_creators")
    .select("id")
    .eq("user_id", user.id)
    .eq("creator_id", creatorId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from("saved_creators")
      .delete()
      .eq("id", existing.id)

    if (error) return { saved: true, error: error.message }

    revalidatePath("/saved")
    revalidatePath("/discover")
    return { saved: false, error: null }
  }

  const { error } = await supabase
    .from("saved_creators")
    .insert({ user_id: user.id, creator_id: creatorId })

  if (error) return { saved: false, error: error.message }

  revalidatePath("/saved")
  revalidatePath("/discover")
  return { saved: true, error: null }
}

export async function getSavedCreatorIds(): Promise<Set<string>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return new Set()

  const { data } = await supabase
    .from("saved_creators")
    .select("creator_id")
    .eq("user_id", user.id)

  return new Set((data ?? []).map((d) => d.creator_id))
}
