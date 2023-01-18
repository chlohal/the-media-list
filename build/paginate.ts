import { TMDB_BASE_IMAGE_URL } from "./TMDBMedia";
import { MinimalViewableMedia, ViewableMedia } from "./ViewableMedia";

export default function paginate(size: number, media: ViewableMedia[]): MediaPage[] {
    const pages: MediaPage[] = [];
    const numPages = Math.ceil(media.length / size);
    for(let i = 0; i < media.length; i += size) {
        pages.push({
            index: i / size,
            hasPrevious: i > 0,
            hasNext: i + size < media.length,
            total: media.length,
            size: size,
            media: media.slice(i, i + size).map(minimalize)
        });
    }
    return pages;
}

function minimalize(media: ViewableMedia): MinimalViewableMedia {
    return {
        mediaId: media.mediaId,
        poster: media.tmdb.poster_path ? `/images${media.tmdb.poster_path}` : "",
        title: media.tmdb.media_type == "movie" ? media.tmdb.title : media.tmdb.name,
        type: media.tmdb.media_type
    }
}

type MediaPage = {
    index: number,
    hasNext: boolean,
    hasPrevious: boolean,
    total: number,
    size: number,
    media: MinimalViewableMedia[]
}