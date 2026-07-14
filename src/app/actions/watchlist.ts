"use server";

import { getOrCreateUser } from "@/lib/user";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleWatchlist(tmdbId: number, title: string, mediaType: "movie" | "tv") {
  const user = await getOrCreateUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const existing = await db.savedTitle.findUnique({
    where: {
      userId_tmdbId_mediaType: {
        userId: user.id,
        tmdbId,
        mediaType,
      },
    },
  });

  let saved = false;

  if (existing) {
    await db.savedTitle.delete({
      where: { id: existing.id },
    });
  } else {
    await db.savedTitle.create({
      data: {
        userId: user.id,
        tmdbId,
        title,
        mediaType,
      },
    });
    saved = true;
  }

  revalidatePath("/watchlist");
  revalidatePath("/");
  revalidatePath("/mood-chat");
  return saved;
}

export async function isTitleSaved(tmdbId: number, mediaType: "movie" | "tv") {
  const user = await getOrCreateUser();
  if (!user) return false;

  const existing = await db.savedTitle.findUnique({
    where: {
      userId_tmdbId_mediaType: {
        userId: user.id,
        tmdbId,
        mediaType,
      },
    },
  });

  return !!existing;
}

export async function getWatchlist() {
  const user = await getOrCreateUser();
  if (!user) return [];

  return db.savedTitle.findMany({
    where: { userId: user.id },
    orderBy: { savedAt: "desc" },
  });
}
