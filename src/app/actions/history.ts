"use server";

import { getOrCreateUser } from "@/lib/user";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function markAsWatched(
  tmdbId: number,
  title: string,
  mediaType: "movie" | "tv",
  rating: number | null
) {
  const user = await getOrCreateUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  // Upsert watch history
  const record = await db.watchHistory.upsert({
    where: {
      userId_tmdbId_mediaType: {
        userId: user.id,
        tmdbId,
        mediaType,
      },
    },
    update: {
      rating,
      watchedAt: new Date(),
    },
    create: {
      userId: user.id,
      tmdbId,
      title,
      mediaType,
      rating,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/watchlist");
  revalidatePath("/mood-chat");
  return record;
}

export async function getWatchHistory() {
  const user = await getOrCreateUser();
  if (!user) return [];

  return db.watchHistory.findMany({
    where: { userId: user.id },
    orderBy: { watchedAt: "desc" },
  });
}

export async function deleteFromHistory(tmdbId: number, mediaType: "movie" | "tv") {
  const user = await getOrCreateUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  await db.watchHistory.delete({
    where: {
      userId_tmdbId_mediaType: {
        userId: user.id,
        tmdbId,
        mediaType,
      },
    },
  });

  revalidatePath("/profile");
}
