"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"
import type { TablesInsert } from "@/types/supabase"

export async function requestConnection(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "Not authenticated. Please log in and try again." }
  }

  const talent_id = formData.get("talent_id") as string

  if (!talent_id) {
    return { error: "Invalid request." }
  }

  if (user.id === talent_id) {
    return { error: "You cannot hire yourself." }
  }

  const project_title = formData.get("project_title") as string
  const initial_pitch = formData.get("initial_pitch") as string
  const budget_estimate = (formData.get("budget_estimate") as string) || null

  if (!project_title?.trim()) {
    return { error: "Project title is required." }
  }
  if (!initial_pitch?.trim()) {
    return { error: "Initial pitch is required." }
  }

  const connectionPayload: TablesInsert<"connections"> = {
    client_id: user.id,
    talent_id,
    project_title: project_title.trim(),
    initial_pitch: initial_pitch.trim(),
    budget_estimate: budget_estimate?.trim() || null,
    status: "pending",
  }

  const { data: connection, error: connError } = await supabase
    .from("connections")
    .insert(connectionPayload)
    .select("id")
    .single()

  if (connError || !connection) {
    return { error: connError?.message ?? "Failed to create connection. Please try again." }
  }

  const messagePayload: TablesInsert<"messages"> = {
    connection_id: connection.id,
    sender_id: user.id,
    content: initial_pitch.trim(),
  }

  const { error: msgError } = await supabase
    .from("messages")
    .insert(messagePayload)

  if (msgError) {
    return { error: msgError.message }
  }

  revalidatePath("/inbox")
  return { error: null }
}
