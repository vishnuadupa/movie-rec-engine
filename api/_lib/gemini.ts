const GEMINI_BASE =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'


export interface GeminiRecommendation {
  title:          string
  year:           number
  genres:         string[]
  synopsis:       string
  reasoning:      string
  moodMatchScore: number
}


export interface GeminiResponse {
  recommendations: GeminiRecommendation[]
}


const SYSTEM_PROMPT = `You are CineAI, a world-class film curator with encyclopedic knowledge of cinema across all genres, eras, and cultures. You give thoughtful, nuanced recommendations and explain your reasoning in a warm, intelligent voice — like a brilliant friend who has seen every movie ever made.


CRITICAL: Respond ONLY with a valid JSON object. No markdown, no backticks, no preamble. Exact schema:
{
  "recommendations": [
    {
      "title": "string",
      "year": 1997,
      "genres": ["string"],
      "synopsis": "string — 2 sentences max",
      "reasoning": "string — 3-4 sentences, specific to this user's request",
      "moodMatchScore": 94
    }
  ]
}`


async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

