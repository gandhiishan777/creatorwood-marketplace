"use client"

import { useState, useRef, useTransition } from "react"
import { toast } from "sonner"
import {
  ArrowUp,
  ArrowDown,
  ImagePlus,
  Link2,
  Loader2,
  Play,
  Trash2,
  Video,
  X,
  ExternalLink,
} from "lucide-react"
import { addPortfolioItem, removePortfolioItem, reorderPortfolioItems } from "@/app/actions/portfolio"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Tables } from "@/types/supabase"

type PortfolioItem = Tables<"portfolio_items">

interface PortfolioManagerProps {
  items: PortfolioItem[]
}

function ItemCard({
  item,
  index,
  total,
  onRemove,
  onMove,
}: {
  item: PortfolioItem
  index: number
  total: number
  onRemove: (id: string) => void
  onMove: (from: number, to: number) => void
}) {
  const [isRemoving, startRemove] = useTransition()

  function handleRemove() {
    startRemove(async () => {
      const result = await removePortfolioItem(item.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        onRemove(item.id)
        toast.success("Removed.")
      }
    })
  }

  return (
    <div className="group relative flex items-center gap-3 rounded-lg border bg-card p-2 transition-colors hover:bg-accent/50">
      {/* Thumbnail */}
      <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-muted">
        {item.thumbnail_url ? (
          <img
            src={item.thumbnail_url}
            alt={item.title ?? "Portfolio item"}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            {item.type === "video_embed" && <Video className="size-5" />}
            {item.type === "link" && <ExternalLink className="size-5" />}
            {item.type === "image" && <ImagePlus className="size-5" />}
          </div>
        )}
        {item.type === "video_embed" && item.thumbnail_url && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex size-7 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
              <Play className="size-3 fill-white text-white translate-x-px" />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {item.title || (item.type === "image" ? "Image" : item.type === "video_embed" ? "Video" : "Link")}
        </p>
        <p className="truncate text-xs text-muted-foreground capitalize">{item.type.replace("_", " ")}</p>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          disabled={index === 0}
          onClick={() => onMove(index, index - 1)}
        >
          <ArrowUp className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          disabled={index === total - 1}
          onClick={() => onMove(index, index + 1)}
        >
          <ArrowDown className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 text-destructive hover:text-destructive"
          onClick={handleRemove}
          disabled={isRemoving}
        >
          {isRemoving ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
        </Button>
      </div>
    </div>
  )
}

export function PortfolioManager({ items: initialItems }: PortfolioManagerProps) {
  const [items, setItems] = useState(initialItems)
  const [open, setOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [videoUrl, setVideoUrl] = useState("")
  const [videoTitle, setVideoTitle] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [linkTitle, setLinkTitle] = useState("")
  const [isAddingVideo, startAddVideo] = useTransition()
  const [isAddingLink, startAddLink] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleRemoveFromList(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  async function handleMove(from: number, to: number) {
    const next = [...items]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setItems(next)

    const result = await reorderPortfolioItems(next.map((i) => i.id))
    if (result.error) toast.error(result.error)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 20 * 1024 * 1024) {
      toast.error("File must be under 20MB.")
      e.target.value = ""
      return
    }

    setIsUploading(true)
    try {
      const fd = new FormData()
      fd.set("type", "image")
      fd.set("file", file)
      const result = await addPortfolioItem(fd)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Image added!")
        setOpen(false)
        // Reload items via page refresh to get the new item from DB
        window.location.reload()
      }
    } finally {
      setIsUploading(false)
      e.target.value = ""
    }
  }

  function handleAddVideo() {
    startAddVideo(async () => {
      const fd = new FormData()
      fd.set("type", "video_embed")
      fd.set("url", videoUrl)
      fd.set("title", videoTitle)
      const result = await addPortfolioItem(fd)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Video added!")
        setVideoUrl("")
        setVideoTitle("")
        setOpen(false)
        window.location.reload()
      }
    })
  }

  function handleAddLink() {
    startAddLink(async () => {
      const fd = new FormData()
      fd.set("type", "link")
      fd.set("url", linkUrl)
      fd.set("title", linkTitle)
      const result = await addPortfolioItem(fd)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Link added!")
        setLinkUrl("")
        setLinkTitle("")
        setOpen(false)
        window.location.reload()
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">Portfolio</Label>
          <p className="text-xs text-muted-foreground">
            Showcase your best work — clients browse portfolios before reaching out.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              <ImagePlus className="size-4" />
              Add Work
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Portfolio Piece</DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="upload" className="mt-2">
              <TabsList className="w-full">
                <TabsTrigger value="upload" className="flex-1">
                  <ImagePlus className="mr-1.5 size-3.5" /> Upload
                </TabsTrigger>
                <TabsTrigger value="video" className="flex-1">
                  <Video className="mr-1.5 size-3.5" /> Video
                </TabsTrigger>
                <TabsTrigger value="link" className="flex-1">
                  <Link2 className="mr-1.5 size-3.5" /> Link
                </TabsTrigger>
              </TabsList>

              {/* Upload Tab */}
              <TabsContent value="upload" className="flex flex-col gap-4 pt-2">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 py-10 transition-colors hover:border-muted-foreground/50"
                >
                  {isUploading ? (
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                  ) : (
                    <ImagePlus className="size-8 text-muted-foreground" />
                  )}
                  <p className="text-sm text-muted-foreground">
                    {isUploading ? "Uploading..." : "Click to upload an image"}
                  </p>
                  <p className="text-xs text-muted-foreground/60">JPG, PNG, WebP — max 20MB</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </TabsContent>

              {/* Video Tab */}
              <TabsContent value="video" className="flex flex-col gap-4 pt-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="video-url">YouTube or Vimeo URL</Label>
                  <Input
                    id="video-url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="video-title">
                    Title <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="video-title"
                    placeholder="My showreel"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAddVideo}
                  disabled={isAddingVideo || !videoUrl.trim()}
                >
                  {isAddingVideo ? (
                    <>
                      <Loader2 className="animate-spin" /> Adding...
                    </>
                  ) : (
                    "Add Video"
                  )}
                </Button>
              </TabsContent>

              {/* Link Tab */}
              <TabsContent value="link" className="flex flex-col gap-4 pt-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="link-url">URL</Label>
                  <Input
                    id="link-url"
                    placeholder="https://behance.net/yourwork"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="link-title">
                    Title <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="link-title"
                    placeholder="My Behance Portfolio"
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAddLink}
                  disabled={isAddingLink || !linkUrl.trim()}
                >
                  {isAddingLink ? (
                    <>
                      <Loader2 className="animate-spin" /> Adding...
                    </>
                  ) : (
                    "Add Link"
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 py-12 text-center">
          <ImagePlus className="mb-3 size-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">Your portfolio is empty</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground/60">
            Add your best work — images, video reels, or links to external portfolios. Clients see this before reaching out.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item, index) => (
            <ItemCard
              key={item.id}
              item={item}
              index={index}
              total={items.length}
              onRemove={handleRemoveFromList}
              onMove={handleMove}
            />
          ))}
        </div>
      )}
    </div>
  )
}
