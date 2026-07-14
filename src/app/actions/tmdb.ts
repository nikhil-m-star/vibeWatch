"use server";

import { fetchWatchProviders, fetchTrending } from "@/lib/tmdb";

export async function getProvidersAction(id: number, type: "movie" | "tv") {
  try {
    return await fetchWatchProviders(id, type);
  } catch (error) {
    console.error(`Failed to get providers for ${type} ${id}:`, error);
    return [];
  }
}

export async function getTrendingPosterPaths() {
  try {
    const list = await fetchTrending();
    // Return absolute image URLs of the top 10 trending items
    return list
      .slice(0, 12)
      .map((m) => m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null)
      .filter((url): url is string => url !== null);
  } catch (error) {
    console.error("Failed to fetch trending poster paths:", error);
    return [];
  }
}
