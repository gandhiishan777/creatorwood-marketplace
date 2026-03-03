"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"
import type { TablesInsert } from "@/types/supabase"

function parseYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match?.[1]) return match[1]
  }
  return null
}

function parseVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match?.[1] ?? null
}

function getVideoEmbed(url: string): {
  embedUrl: string
  thumbnailUrl: string
} | null {
  const ytId = parseYouTubeId(url)
  if (ytId) {
    return {
      embedUrl: `https://www.youtube.com/embed/${ytId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
    }
  }

  const vimeoId = parseVimeoId(url)
  if (vimeoId) {
    return {
      embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
      thumbnailUrl: `https://vumbnail.com/${vimeoId}.jpg`,
    }
  }

  return null
}

export async function addPortfolioItem(
  formData: FormData
): Promise<{ error: string | null; id: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return { error: "Not authenticated.", id: null }

  const type = formData.get("type") as string
  const title = (formData.get("title") as string)?.trim() || null

  const { count } = await supabase
    .from("portfolio_items")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", user.id)

  const sortOrder = (count ?? 0)

  if (type === "image") {
    const file = formData.get("file") as File | null
    if (!file || file.size === 0) return { error: "No file provided.", id: null }

    if (file.size > 20 * 1024 * 1024) {
      return { error: "File must be under 20MB.", id: null }
    }

    const ext = file.name.split(".").pop() ?? "jpg"
    const path = `${user.id}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from("portfolio")
      .upload(path, file, { upsert: true })

    if (uploadError) return { error: uploadError.message, id: null }

    const { data: urlData } = supabase.storage
      .from("portfolio")
      .getPublicUrl(path)

    const payload: TablesInsert<"portfolio_items"> = {
      profile_id: user.id,
      type: "image",
      url: urlData.publicUrl,
      thumbnail_url: urlData.publicUrl,
      title,
      sort_order: sortOrder,
    }

    const { data, error } = await supabase
      .from("portfolio_items")
      .insert(payload)
      .select("id")
      .single()

    if (error) return { error: error.message, id: null }

    revalidatePath("/settings")
    revalidatePath(`/profile/${user.id}`)
    return { error: null, id: data.id }
  }

  if (type === "video_embed") {
    const videoUrl = formData.get("url") as string
    if (!videoUrl?.trim()) return { error: "Video URL is required.", id: null }

    const embed = getVideoEmbed(videoUrl.trim())
    if (!embed) {
      return { error: "Unsupported video URL. Use YouTube or Vimeo links.", id: null }
    }

    const payload: TablesInsert<"portfolio_items"> = {
      profile_id: user.id,
      type: "video_embed",
      url: embed.embedUrl,
      thumbnail_url: embed.thumbnailUrl,
      title,
      sort_order: sortOrder,
    }

    const { data, error } = await supabase
      .from("portfolio_items")
      .insert(payload)
      .select("id")
      .single()

    if (error) return { error: error.message, id: null }

    revalidatePath("/settings")
    revalidatePath(`/profile/${user.id}`)
    return { error: null, id: data.id }
  }

  if (type === "link") {
    const linkUrl = formData.get("url") as string
    if (!linkUrl?.trim()) return { error: "URL is required.", id: null }

    const payload: TablesInsert<"portfolio_items"> = {
      profile_id: user.id,
      type: "link",
      url: linkUrl.trim(),
      title: title || new URL(linkUrl.trim()).hostname,
      sort_order: sortOrder,
    }

    const { data, error } = await supabase
      .from("portfolio_items")
      .insert(payload)
      .select("id")
      .single()

    if (error) return { error: error.message, id: null }

    revalidatePath("/settings")
    revalidatePath(`/profile/${user.id}`)
    return { error: null, id: data.id }
  }

  return { error: "Invalid item type.", id: null }
}

export async function removePortfolioItem(
  itemId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return { error: "Not authenticated." }

  const { data: item } = await supabase
    .from("portfolio_items")
    .select("id, profile_id, type, url")
    .eq("id", itemId)
    .single()

  if (!item) return { error: "Item not found." }
  if (item.profile_id !== user.id) return { error: "Not authorized." }

  if (item.type === "image") {
    const urlObj = new URL(item.url)
    const storagePath = urlObj.pathname.split("/portfolio/")[1]
    if (storagePath) {
      await supabase.storage.from("portfolio").remove([decodeURIComponent(storagePath)])
    }
  }

  const { error } = await supabase
    .from("portfolio_items")
    .delete()
    .eq("id", itemId)

  if (error) return { error: error.message }

  revalidatePath("/settings")
  revalidatePath(`/profile/${user.id}`)
  return { error: null }
}

export async function reorderPortfolioItems(
  orderedIds: string[]
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return { error: "Not authenticated." }

  const updates = orderedIds.map((id, index) =>
    supabase
      .from("portfolio_items")
      .update({ sort_order: index })
      .eq("id", id)
      .eq("profile_id", user.id)
  )

  const results = await Promise.all(updates)
  const failed = results.find((r) => r.error)
  if (failed?.error) return { error: failed.error.message }

  revalidatePath("/settings")
  revalidatePath(`/profile/${user.id}`)
  return { error: null }
}
