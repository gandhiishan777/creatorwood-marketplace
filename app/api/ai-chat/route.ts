import { streamText, tool, stepCountIs, convertToModelMessages } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import { buildCreatorContext } from "@/lib/ai-context"

export async function POST(req: Request) {
  const { messages: uiMessages } = await req.json()
  const messages = await convertToModelMessages(uiMessages)

  const creatorContext = await buildCreatorContext()

  const systemPrompt = `You are the Creatorwood AI Casting Assistant — a friendly, knowledgeable concierge who helps clients find the perfect AI creator for their project.

You have access to every discoverable creator on the platform, including their bio, roles, hourly rates, ratings, and review comments. Use this data to make informed, personalized recommendations.

CREATOR DATABASE:
${creatorContext}

GUIDELINES:
- You MUST call the showCreatorCards tool with profile IDs every time you recommend or mention specific creators. NEVER describe displaying cards or announce that you will show them — just call the tool silently alongside your text.
- NEVER use markdown formatting. No headers (###), no bold (**), no italic (*), no bullet lists (- or *). Write plain conversational text only. The chat UI does not render markdown.
- Keep responses short and conversational — 2-4 sentences max. Briefly explain WHY you recommend each creator (rating, relevant role, rate, or a review quote). Let the creator cards do the heavy lifting visually.
- If the user's request is vague, ask 1-2 clarifying questions (budget, timeline, style preference) before recommending.
- If no creators match, say so honestly and suggest broadening the criteria.
- You can compare creators side-by-side when asked.
- Never fabricate creators or reviews. Only reference data from the creator database above.
- When quoting reviews, use the exact text from the database.`

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    messages,
    tools: {
      showCreatorCards: tool({
        description:
          "Display creator profile cards to the user. Call this whenever you recommend or mention specific creators.",
        inputSchema: z.object({
          profileIds: z
            .array(z.string())
            .describe("Array of creator profile IDs to display as cards"),
        }),
        execute: async ({ profileIds }) => ({
          displayed: profileIds,
        }),
      }),
    },
    stopWhen: stepCountIs(3),
  })

  return result.toUIMessageStreamResponse()
}
