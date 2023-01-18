import { DoesTheDogDieItem } from "./DoesTheDogDieItem.js";
import { iso8601 } from "./format-types.js";
import { TMDBCollectedMedia } from "./TMDBMedia.js";

type dormId = "wright" | "bullock" | "hughes" | "dana";

export type ViewableMedia = {
    mediaId: string,
    tmdb: TMDBCollectedMedia;
    d4: DoesTheDogDieItem | undefined;
    meta: ViewingMetadata;
}

export type ViewingMetadata = {
    addedOn: iso8601,
    watched?: ViewingSession[]
}

export type MinimalViewableMedia = {
    title: string,
    poster: string,
    mediaId: string,
    type: "movie" | "tv"
}

export type ViewingSession = {
    date: iso8601,
    id?: string,
    from: MediaSection,
    to: MediaSection
    metatags: { [key: string]: string }
}

export type MediaSection = {
    episode?: number,
    season?: number,
    minute?: number
}