import { readdirSync } from "node:fs";
import { DoesTheDogDieItem } from "./DoesTheDogDieItem.js";
import readJson from "./readJson";
import paginate from "./paginate";
import { TMDBCollectedMedia } from "./TMDBMedia";
import { ViewableMedia, ViewingMetadata } from "./ViewableMedia.js";
import { safeWriteFileSync } from "./safeFileUtils";
import { renderMediaPage } from "./render-media-html";


const dataDirectory = __dirname + "/../data";

const media: ViewableMedia[] = readdirSync(dataDirectory).map(x=>({
    mediaId: x,
    tmdb: readJson(`${dataDirectory}/${x}/tmdb.json`) as TMDBCollectedMedia,
    d4: readJson(`${dataDirectory}/${x}/d4.json`) as DoesTheDogDieItem,
    meta: readJson(`${dataDirectory}/${x}/meta.json`, {}) as ViewingMetadata
})).sort((a, b) => a.meta.addedOn > b.meta.addedOn ? -1 : 1)

const pages = paginate(50, media);

for(const page of pages) {
    safeWriteFileSync(__dirname + "/../public/api/media/pages/" + page.index, JSON.stringify(page));
}

for(const m of media) renderMedia(m);

function renderMedia(media: ViewableMedia) {
    //make API entry
    safeWriteFileSync(__dirname + "/../public/api/media/id/" + media.mediaId, JSON.stringify(media));
    
    //and pre-render html page
    safeWriteFileSync(__dirname + "/../public/media/" + media.mediaId + ".html", renderMediaPage(media));
}