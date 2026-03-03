"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"
import type { TablesInsert } from "@/types/supabase"

export async function submitReview(
  _prevState: { error: string | null; success: boolean },
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "Not authenticated.", success: false }
  }

  const connectionId = formData.get("connection_id") as string
  const ratingStr = formData.get("rating") as string
  const comment = (formData.get("comment") as string)?.trim() || null

  if (!connectionId) return { error: "Missing connection.", success: false }

  const rating = parseInt(ratingStr, 10)
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return { error: "Rating must be between 1 and 5.", success: false }
  }

  const { data: connection } = await supabase
    .from("connections")
    .select("client_id, talent_id, status")
    .eq("id", connectionId)
    .single()

  if (!connection) return { error: "Connection not found.", success: false }

  if (connection.status !== "completed") {
    return { error: "Can only review completed projects.", success: false }
  }

  if (connection.client_id !== user.id) {
    return { error: "Only the client can leave a review.", success: false }
  }

  const targetId = connection.talent_id

  // Check for existing review
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("connection_id", connectionId)
    .eq("reviewer_id", user.id)
    .maybeSingle()

  if (existing) {
    return { error: "You've already reviewed this project.", success: false }
  }

  const payload: TablesInsert<"reviews"> = {
    connection_id: connectionId,
    reviewer_id: user.id,
    target_id: targetId,
    rating,
    comment,
  }

  const { error } = await supabase.from("reviews").insert(payload)

  if (error) return { error: error.message, success: false }

  revalidatePath(`/inbox/${connectionId}`)
  revalidatePath(`/profile/${targetId}`)
  return { error: null, success: true }
}
