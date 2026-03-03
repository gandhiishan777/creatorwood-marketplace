export const CREATOR_ROLES = [
  "Director",
  "Writer",
  "Producer",
  "Editor",
] as const

export type CreatorRole = (typeof CREATOR_ROLES)[number]
