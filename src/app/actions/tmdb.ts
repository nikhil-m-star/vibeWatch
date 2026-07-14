"use server";

import { fetchWatchProviders } from "@/lib/tmdb";

export async function getProvidersAction(id: number, type: "movie" | "tv") {
  try {
    return await fetchWatchProviders(id, type);
  } catch (error) {
    console.error(`Failed to get providers for ${type} ${id}:`, error);
    return [];
  }
}
