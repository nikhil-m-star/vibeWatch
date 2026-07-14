const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  media_type: "movie" | "tv";
  vote_average?: number;
}

export interface WatchProvider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
}

async function fetchFromTMDB(endpoint: string, params: Record<string, string> = {}) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.warn("TMDB_API_KEY is not configured in .env file.");
    return null;
  }

  const queryParams = new URLSearchParams({
    api_key: apiKey,
    ...params,
  });

  const url = `${TMDB_BASE_URL}${endpoint}?${queryParams.toString()}`;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
    if (!res.ok) {
      console.error(`TMDB API Error: ${res.status} ${res.statusText} for ${endpoint}`);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error(`TMDB Fetch Error for ${endpoint}:`, error);
    return null;
  }
}

export async function fetchNowPlaying(): Promise<TMDBMovie[]> {
  const data = await fetchFromTMDB("/movie/now_playing", {
    region: "IN",
    language: "en-US",
    page: "1",
  });
  if (!data || !data.results) return [];
  return data.results.map((item: any) => ({
    id: item.id,
    title: item.title,
    overview: item.overview,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    release_date: item.release_date,
    media_type: "movie" as const,
    vote_average: item.vote_average,
  }));
}

export async function fetchUpcoming(): Promise<TMDBMovie[]> {
  const movieData = await fetchFromTMDB("/movie/upcoming", {
    region: "IN",
    language: "en-US",
    page: "1",
  });
  const tvData = await fetchFromTMDB("/tv/on_the_air", {
    language: "en-US",
    page: "1",
  });

  const movies = movieData?.results?.map((item: any) => ({
    id: item.id,
    title: item.title,
    overview: item.overview,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    release_date: item.release_date,
    media_type: "movie" as const,
    vote_average: item.vote_average,
  })) || [];

  const tvShows = tvData?.results?.map((item: any) => ({
    id: item.id,
    title: item.name, // TV shows use name instead of title
    overview: item.overview,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    release_date: item.first_air_date, // TV uses first_air_date
    media_type: "tv" as const,
    vote_average: item.vote_average,
  })) || [];

  return [...movies, ...tvShows];
}

export async function searchTitle(title: string, type: "movie" | "tv"): Promise<TMDBMovie | null> {
  const endpoint = type === "movie" ? "/search/movie" : "/search/tv";
  const data = await fetchFromTMDB(endpoint, {
    query: title,
    language: "en-US",
    page: "1",
  });

  if (!data || !data.results || data.results.length === 0) return null;
  const item = data.results[0];
  return {
    id: item.id,
    title: type === "movie" ? item.title : item.name,
    overview: item.overview,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    release_date: type === "movie" ? item.release_date : item.first_air_date,
    media_type: type,
    vote_average: item.vote_average,
  };
}

export async function fetchTitleDetails(id: number, type: "movie" | "tv"): Promise<TMDBMovie | null> {
  const data = await fetchFromTMDB(`/${type}/${id}`, {
    language: "en-US",
  });
  if (!data) return null;
  return {
    id: data.id,
    title: type === "movie" ? data.title : data.name,
    overview: data.overview,
    poster_path: data.poster_path,
    backdrop_path: data.backdrop_path,
    release_date: type === "movie" ? data.release_date : data.first_air_date,
    media_type: type,
    vote_average: data.vote_average,
  };
}


export async function fetchWatchProviders(id: number, type: "movie" | "tv"): Promise<WatchProvider[]> {
  const data = await fetchFromTMDB(`/${type}/${id}/watch/providers`);
  if (!data || !data.results) return [];

  const inProviders = data.results.IN;
  if (!inProviders) return [];

  const flatrate = inProviders.flatrate || [];
  const ads = inProviders.ads || [];
  
  const providersMap = new Map<number, WatchProvider>();
  
  [...flatrate, ...ads].forEach((p: any) => {
    providersMap.set(p.provider_id, {
      logo_path: p.logo_path,
      provider_id: p.provider_id,
      provider_name: p.provider_name,
    });
  });

  return Array.from(providersMap.values());
}
