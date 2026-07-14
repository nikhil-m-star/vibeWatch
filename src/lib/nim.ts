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
  return interpretFinalTags(conversation, watchHistory);
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

  const watchedTitles = watchHistory.map((h) => h.title);

  const systemPrompt = `You are Vibe Watch's expert premium cinema recommender. Based on the user's conversation, mood tags, and watch history, recommend 6 real, highly relevant movies or TV shows.
Include a specific, short, personalized explanation (1-2 sentences) for why each title fits their mood ("reason").
Do NOT invent titles. Only suggest real, searchable movies or TV shows.

CRITICAL EXCLUSIONS (DO NOT RECOMMEND):
- You MUST NOT recommend any of these titles under any circumstances: ${watchedTitles.join(", ")}

ALGORITHM REQUIREMENTS:
1. EXPLICIT FRANCHISE / TOPIC OVERRIDE:
   - If the user explicitly asks for a specific franchise (e.g., "Spider-Man", "Batman", "Star Wars", "Marvel", "Harry Potter") or a very specific topic, you MUST focus all 6 recommendations entirely on that franchise or topic.
   - Do NOT mix in unrelated general movies or shows in this case. Keep the focus 100% on their explicit request.

2. QUALITY DISCOVERY FORMULA (General Queries):
   - For general mood queries (when no specific franchise/topic is requested), recommend exactly 6 titles with this strict distribution:
     * 2 "Critical Darlings / Cult Classics": highly acclaimed masterpieces (e.g., Succession, Chernobyl, Whiplash, Severance, Mindhunter, Fleabag).
     * 2 "Mainstream Hits": popular crowd-pleasers.
     * 2 "Hidden Gems / Underrated Discoveries": less-mainstream, critically beloved, or niche titles (e.g., Coherence, Dark, Scavengers Reign, The Leftovers, Mr. Robot, Patriot).

3. WATCH HISTORY INTEGRATION:
   - If a title in their history has a high rating (>= 8), suggest similar thematic/tonal titles. If a title has a low rating (<= 5), avoid similar titles.

4. REPEATED RECOMMENDATIONS PERMITTED:
   - It is completely fine to recommend titles that you have suggested in previous turns of this conversation, or titles recommended in past queries, if they are still highly relevant to the user's latest message.

5. DYNAMIC IN-THEATRES & UPCOMING SELECTIONS:
   - You can recommend movies currently in theatres or upcoming releases when they match the requested vibe. Here is the active list:
${releasesList || "No active list available."}
   - If you suggest a title from this list, you MUST mention it clearly in the reason (e.g. "Catch it now in theatres!" or "Keep an eye out for this upcoming release!").

6. SPECIFIC FRANCHISE/TONE ALIGNMENT:
   - If the user asks for a character or franchise in a specific tone (e.g. serious/dark Spider-Man, gritty Batman, lighthearted sci-fi), prioritize recommending the specific entries or spin-offs from that franchise that match the requested tone (e.g. Spider-Man Noir / Mr. Robot for dark themes, rather than unrelated or generic entries).

7. HYPER-PERSONALIZED REASONING:
   - The "reason" MUST connect the title back to the user's specific requested tone and pacing.
   - Do NOT just summarize the plot. Explicitly mention how the pacing (slow-burn, fast-paced) and tone match their vibe.
     (e.g., "Since you wanted a slow-burn cerebral thriller, this show's somber tone and meticulous pacing will keep you hooked.")

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

export async function generateSingleReplacement(
  conversation: ChatMessage[],
  tags: { genres: string[]; tone: string[]; pacing: string },
  watchHistory: { title: string; mediaType: string; rating: number | null }[],
  excludeTitles: string[],
  currentReleases: { title: string; mediaType: "movie" | "tv"; releaseDate?: string; type: "now_playing" | "upcoming" }[] = []
): Promise<AIRecommendation | null> {
  const systemPrompt = `You are Vibe Watch's expert cinema recommender. The user marked a previous suggestion as watched.
Provide exactly ONE new, real, highly relevant movie or TV show suggestion that fits their mood.
Only suggest a real, searchable movie or TV show.

EXCLUSION LIST:
- Do NOT suggest any of these titles (already shown or watched): ${excludeTitles.join(", ")}
- Watch History: ${JSON.stringify(watchHistory)}

Your response MUST be a JSON object containing a single recommendation:
{
  "title": "Title Name",
  "mediaType": "movie" | "tv",
  "reason": "Why this fits your mood..."
}
`;

  const responseText = await callNIM([
    { role: "system", content: systemPrompt },
    ...conversation,
  ], true);

  try {
    const parsed = JSON.parse(responseText.trim());
    return parsed;
  } catch (error) {
    console.error("Failed to parse single replacement JSON:", responseText, error);
    return null;
  }
}
