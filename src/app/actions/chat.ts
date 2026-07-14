"use server";

import { getOrCreateUser } from "@/lib/user";
import { db } from "@/lib/db";
import { interpretMoodAndQuestion, generateRecommendations, ChatMessage } from "@/lib/nim";
import { searchTitle, fetchNowPlaying, fetchUpcoming } from "@/lib/tmdb";
import { revalidatePath } from "next/cache";
import { checkRateLimit } from "@/lib/rateLimit";

export async function sendChatMessage(queryId: string | null, messageText: string) {
  const user = await getOrCreateUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get user watch history for personalization context
  const history = await db.watchHistory.findMany({
    where: { userId: user.id },
    select: { title: true, mediaType: true, rating: true },
  });

  // Basic rate limiting: 10 requests per minute per user
  const { success } = checkRateLimit(user.id, 10, 60000);
  if (!success) {
    return {
      error: true,
      message: "Too many requests. Please wait a minute.",
      conversation: [],
      readyToRecommend: false,
      recommendations: [],
      queryId: queryId || ""
    } as any;
  }

  let moodQuery: any = null;
  let conversation: ChatMessage[] = [];

  if (queryId) {
    moodQuery = await db.moodQuery.findUnique({
      where: { id: queryId },
    });
    if (!moodQuery) {
      throw new Error("Conversation session not found.");
    }
    conversation = moodQuery.conversation as ChatMessage[];
  }

  // Append user's message
  conversation.push({ role: "user", content: messageText });

  let interpretedResult;
  let recommendations: any[] = [];
  let errorOccurred = false;

  try {
    // Call NVIDIA NIM to interpret the mood
    interpretedResult = await interpretMoodAndQuestion(conversation, history);
  } catch (err) {
    console.error("NIM Error in interpretation:", err);
    errorOccurred = true;
    interpretedResult = {
      readyToRecommend: true,
      followUpQuestion: null,
      interpretedTags: {
        genres: ["Drama", "Comedy"],
        tone: ["Chill"],
        pacing: "medium",
      },
    };
  }

  if (interpretedResult.readyToRecommend) {
    let aiRecs: any[] = [];
    if (!errorOccurred) {
      try {
        const [nowPlaying, upcoming] = await Promise.all([
          fetchNowPlaying().catch(() => []),
          fetchUpcoming().catch(() => []),
        ]);
        const currentReleases = [
          ...(nowPlaying || []).map((m) => ({ title: m.title, mediaType: m.media_type, releaseDate: m.release_date, type: "now_playing" as const })),
          ...(upcoming || []).map((m) => ({ title: m.title, mediaType: m.media_type, releaseDate: m.release_date, type: "upcoming" as const })),
        ];

        aiRecs = await generateRecommendations(
          conversation,
          interpretedResult.interpretedTags || { genres: [], tone: [], pacing: "medium" },
          history,
          currentReleases
        );
      } catch (err) {
        console.error("NIM Error in recommendations:", err);
        errorOccurred = true;
      }
    }

    if (errorOccurred || aiRecs.length === 0) {
      // Fallback: search some default popular movies/shows on TMDB
      aiRecs = [
        { title: "Inception", mediaType: "movie", reason: "Our AI interpretation is currently offline, but this mind-bending masterpiece is always a perfect watch." },
        { title: "The Dark Knight", mediaType: "movie", reason: "An iconic superhero crime thriller that fits high-energy and gripping mood demands." },
        { title: "Friends", mediaType: "tv", reason: "The absolute ultimate lighthearted comedy comfort show to match a chill mood." },
        { title: "Breaking Bad", mediaType: "tv", reason: "An intense, premium crime drama to satisfy an engaging, slow-burn binge mood." }
      ];
    }

    // Cross-reference with TMDB to get actual metadata and filter invalid titles
    const verifiedRecsResults = await Promise.all(
      aiRecs.map(async (rec) => {
        try {
          const tmdbMeta = await searchTitle(rec.title, rec.mediaType as "movie" | "tv");
          if (tmdbMeta) {
            return {
              tmdbId: tmdbMeta.id,
              title: tmdbMeta.title,
              mediaType: tmdbMeta.media_type,
              posterPath: tmdbMeta.poster_path,
              reason: rec.reason,
            };
          }
        } catch (err) {
          console.error(`TMDB search failed for ${rec.title}:`, err);
        }
        return null;
      })
    );
    const verifiedRecs = verifiedRecsResults.filter((r): r is NonNullable<typeof r> => r !== null);

    // Save final conversation completion message
    const tagsString = interpretedResult.interpretedTags?.tone?.join(", ") || "Chill";
    conversation.push({
      role: "assistant",
      content: `I've interpreted your vibe as: ${tagsString}. Here are my personalized recommendations for you!`,
    });

    if (moodQuery) {
      moodQuery = await db.moodQuery.update({
        where: { id: moodQuery.id },
        data: {
          conversation: conversation as any,
          interpretedTags: (interpretedResult.interpretedTags || {}) as any,
        },
      });
    } else {
      moodQuery = await db.moodQuery.create({
        data: {
          userId: user.id,
          conversation: conversation as any,
          interpretedTags: (interpretedResult.interpretedTags || {}) as any,
        },
      });
    }

    // Save recommendations and link to moodQuery
    const savedRecs = await Promise.all(
      verifiedRecs.map((rec) =>
        db.recommendation.create({
          data: {
            moodQueryId: moodQuery.id,
            tmdbId: rec.tmdbId,
            title: rec.title,
            mediaType: rec.mediaType,
            posterPath: rec.posterPath,
            reason: rec.reason,
          },
        })
      )
    );

    revalidatePath("/profile");
    return {
      queryId: moodQuery.id,
      conversation,
      readyToRecommend: true,
      recommendations: savedRecs,
    };
  } else {
    // Add the follow-up question
    const followUp = interpretedResult.followUpQuestion || "Could you tell me if you prefer a movie or a TV show?";
    conversation.push({ role: "assistant", content: followUp });

    if (moodQuery) {
      moodQuery = await db.moodQuery.update({
        where: { id: moodQuery.id },
        data: {
          conversation: conversation as any,
        },
      });
    } else {
      moodQuery = await db.moodQuery.create({
        data: {
          userId: user.id,
          conversation: conversation as any,
          interpretedTags: {},
        },
      });
    }

    return {
      queryId: moodQuery.id,
      conversation,
      readyToRecommend: false,
      recommendations: [],
    };
  }
}

export async function getPastQueries() {
  const user = await getOrCreateUser();
  if (!user) return [];

  return db.moodQuery.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      recommendations: true,
    },
  });
}
