export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface InterpretedMood {
  readyToRecommend: boolean;
  followUpQuestion: string | null;
  interpretedTags: {
    genres: string[];
    tone: string[];
    pacing: string;
  } | null;
}

export interface AIRecommendation {
  title: string;
  mediaType: "movie" | "tv";
  reason: string;
}

const NIM_BASE_URL = "https://integrate.api.nvidia.com/v1";
const MODEL_NAME = "meta/llama-3.1-8b-instruct";

async function callNIM(messages: { role: string; content: string }[], jsonMode = false) {
  const apiKey = process.env.NVIDIA_NIM_API_KEY;
  if (!apiKey) {
    throw new Error("NVIDIA_NIM_API_KEY is not configured in .env file.");
  }

  try {
    const res = await fetch(`${NIM_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages,
        temperature: 0.2,
        max_tokens: 1024,
        response_format: jsonMode ? { type: "json_object" } : undefined,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`NVIDIA NIM error: ${res.status} - ${errText}`);
      throw new Error(`NVIDIA NIM API error: ${res.statusText}`);
    }

    const data = await res.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("NIM Request Error:", error);
    throw error;
  }
}

export async function interpretMoodAndQuestion(
  conversation: ChatMessage[],
  watchHistory: { title: string; mediaType: string; rating: number | null }[]
): Promise<InterpretedMood> {
  const assistantTurns = conversation.filter((m) => m.role === "assistant");
  
  // Cap at 3 follow-up questions
  if (assistantTurns.length >= 3) {
    return interpretFinalTags(conversation, watchHistory);
  }

  // Check if user requested to skip to recommendations
  const lastUserMsg = [...conversation].reverse().find((m) => m.role === "user")?.content.toLowerCase() || "";
  const isSkip = lastUserMsg.includes("skip") || 
                 lastUserMsg.includes("just recommend") || 
                 lastUserMsg.includes("show me") || 
                 lastUserMsg.includes("direct recommend") ||
                 lastUserMsg.includes("don't want to answer");

  if (isSkip) {
    return interpretFinalTags(conversation, watchHistory);
  }

  const systemPrompt = `You are Vibe Watch's premium concierge assistant. Your job is to interpret the user's emotional state or mood and determine if you have enough context to recommend movies or TV shows.
You can ask up to 3 targeted follow-up questions total to narrow things down (focusing on genre preference, movie vs series, time available, energy level).
Currently, you have already asked ${assistantTurns.length} questions.

If you have enough detail (genres, tone, pacing preferences) OR if you have reached the limit of 3 questions, set readyToRecommend to true. Otherwise, set it to false and ask ONE short, engaging follow-up question.
Do NOT ask more than one question. Keep the question premium, concise, and focused.

Your response MUST be a JSON object with this exact structure:
{
  "readyToRecommend": boolean,
  "followUpQuestion": "your follow up question string here" or null,
  "interpretedTags": {
    "genres": ["list", "of", "genres"],
    "tone": ["list", "of", "tones"],
    "pacing": "fast" | "medium" | "slow"
  } or null
}

Watch History context (use this to avoid recommending previously watched/rated titles unless requested):
${JSON.stringify(watchHistory)}
`;

  const responseText = await callNIM([
    { role: "system", content: systemPrompt },
    ...conversation,
  ], true);

  try {
    return JSON.parse(responseText.trim()) as InterpretedMood;
  } catch (error) {
    console.error("Failed to parse NIM response as JSON:", responseText, error);
    // Safe fallback
    return {
      readyToRecommend: true,
      followUpQuestion: null,
      interpretedTags: {
        genres: ["Drama"],
        tone: ["Emotional"],
        pacing: "medium",
      },
    };
  }
}

async function interpretFinalTags(
  conversation: ChatMessage[],
  watchHistory: { title: string; mediaType: string; rating: number | null }[]
): Promise<InterpretedMood> {
  const systemPrompt = `You are Vibe Watch's premium concierge assistant. The conversation has concluded. Extract the final mood tags, tone, and pacing from the conversation to generate recommendations.
  
Your response MUST be a JSON object with this exact structure:
{
  "readyToRecommend": true,
  "followUpQuestion": null,
  "interpretedTags": {
    "genres": ["genre1", "genre2"],
    "tone": ["tone1", "tone2"],
    "pacing": "fast" | "medium" | "slow"
  }
}

Watch History:
${JSON.stringify(watchHistory)}
`;
  const responseText = await callNIM([
    { role: "system", content: systemPrompt },
    ...conversation,
  ], true);

  try {
    return JSON.parse(responseText.trim()) as InterpretedMood;
  } catch (error) {
    console.error("Failed to parse final tags:", responseText, error);
    return {
      readyToRecommend: true,
      followUpQuestion: null,
      interpretedTags: {
        genres: [],
        tone: [],
        pacing: "medium",
      },
    };
  }
}

export async function generateRecommendations(
  conversation: ChatMessage[],
  tags: { genres: string[]; tone: string[]; pacing: string },
  watchHistory: { title: string; mediaType: string; rating: number | null }[],
  currentReleases: { title: string; mediaType: "movie" | "tv"; releaseDate?: string; type: "now_playing" | "upcoming" }[] = []
): Promise<AIRecommendation[]> {
  const releasesList = currentReleases
    .map((r) => `- [${r.type === "now_playing" ? "IN THEATRES NOW" : "UPCOMING RELEASE"}] ${r.title} (${r.mediaType})`)
    .join("\n");

  const systemPrompt = `You are Vibe Watch's expert cinema recommender. Based on the user's conversation, mood tags, and watch history, recommend 6 real, highly relevant movies or TV shows.
Include a specific, short, personalized explanation (1-2 sentences) for why each title fits their mood ("reason").
Do NOT invent titles. Only suggest real, searchable movies or TV shows.

You MUST recommend a mix of:
1. Popular movies or TV shows available on major OTT platforms (Netflix, Amazon Prime Video, Disney+ Hotstar, Apple TV+, Zee5, SonyLIV, JioCinema, etc.).
2. Movies currently in theatres or upcoming releases (when they fit the mood). Here is a list of movies/shows currently in theatres or releasing soon:
${releasesList || "No current list available."}

IMPORTANT CULTURAL GUIDELINE:
- If a user asks for a dark, gritty, or serious "Spider-Man" series or show, you MUST prioritize recommending the upcoming series "Spider-Noir" (TV show) or "Spider-Man Noir" (TV show) or "Spider-Man: The New Animated Series" (TV show).

If you suggest a title from the In-Theatres or Upcoming list, mention that clearly in the "reason" (e.g. "Catch it now in theatres!" or "Keep an eye out for this upcoming release!").

Prefer suggesting things they haven't watched, or similar to highly rated ones in their history:
Watch History: ${JSON.stringify(watchHistory)}

Final Mood/Preference Tags:
- Genres: ${tags.genres.join(", ")}
- Tone: ${tags.tone.join(", ")}
- Pacing: ${tags.pacing}

Your response MUST be a JSON object containing an array called "recommendations":
{
  "recommendations": [
    {
      "title": "Title Name",
      "mediaType": "movie" | "tv",
      "reason": "Why this fits your mood..."
    },
    ...
  ]
}
`;

  const responseText = await callNIM([
    { role: "system", content: systemPrompt },
    ...conversation,
  ], true);

  try {
    const parsed = JSON.parse(responseText.trim());
    return parsed.recommendations || [];
  } catch (error) {
    console.error("Failed to parse recommendations JSON:", responseText, error);
    return [];
  }
}
