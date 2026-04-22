import { createClient } from '@/utils/supabase/server'
import LandingPage from '@/components/landing/LandingPage'
import type { Creator } from '@/components/landing/LandingPage'

// Fallback Unsplash images when no DB content exists
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=900&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=900&q=80',
  'https://images.unsplash.com/photo-1481487196290-c152efe083f5?w=900&q=80',
  'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=900&q=80',
  'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=900&q=80',
  'https://images.unsplash.com/photo-1493514789931-586cb221d7a7?w=900&q=80',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=900&q=80',
  'https://images.unsplash.com/photo-1520262454473-a1a82276a574?w=900&q=80',
  'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=900&q=80',
  'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=900&q=80',
  'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=900&q=80',
]

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch 12 portfolio items for the 3D card scene
  const { data: portfolioItems } = await supabase
    .from('portfolio_items')
    .select('image_url, thumbnail_url')
    .not('image_url', 'is', null)
    .order('sort_order', { ascending: true })
    .limit(12)

  // Fetch 8 discoverable creators for the creator grid
  const { data: profilesRaw } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, roles, hourly_rate')
    .eq('is_discoverable', true)
    .order('created_at', { ascending: false })
    .limit(8)

  // Fetch first portfolio thumbnail for each creator
  const creatorThumbnails = new Map<string, string>()
  if (profilesRaw && profilesRaw.length > 0) {
    const { data: thumbItems } = await supabase
      .from('portfolio_items')
      .select('profile_id, thumbnail_url')
      .in('profile_id', profilesRaw.map((p) => p.id))
      .not('thumbnail_url', 'is', null)
      .order('sort_order', { ascending: true })

    if (thumbItems) {
      for (const item of thumbItems) {
        if (!creatorThumbnails.has(item.profile_id) && item.thumbnail_url) {
          creatorThumbnails.set(item.profile_id, item.thumbnail_url)
        }
      }
    }
  }

  // Build portfolio image list for 3D scene
  const portfolioImages: string[] = []
  if (portfolioItems) {
    for (const item of portfolioItems) {
      const url = item.image_url || item.thumbnail_url
      if (url) portfolioImages.push(url)
    }
  }
  // Pad with fallbacks if needed
  while (portfolioImages.length < 9) {
    portfolioImages.push(FALLBACK_IMAGES[portfolioImages.length % FALLBACK_IMAGES.length])
  }

  // Build creator list
  const creators: Creator[] = (profilesRaw ?? []).map((p) => ({
    id: p.id,
    display_name: p.display_name ?? 'Creator',
    avatar_url: p.avatar_url ?? null,
    roles: Array.isArray(p.roles) ? p.roles : (p.roles ? [p.roles] : null),
    hourly_rate: p.hourly_rate ?? null,
    thumbnail_url: creatorThumbnails.get(p.id) ?? null,
  }))

  return <LandingPage portfolioImages={portfolioImages} creators={creators} />
}
