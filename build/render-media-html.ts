import { TMDBWatchProviderMapByCountry } from "./TMDBMedia";
import { MediaSection, ViewableMedia, ViewingSession } from "./ViewableMedia";

export function renderMediaPage(media: ViewableMedia) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="/media.css">
    
    <script src="/media-progressive.js" defer></script>

    <meta name="viewport" content="width=device-width">
    
    <script>
    var MEDIA_ID = "${media.mediaId}", MEDIA_TYPE = "${media.tmdb.media_type}";
    </script>
</head>

<body>
    <main id="main">
    ${renderMedia(media)}
    </main>
</body>

</html>`
}

export function renderMedia(media: ViewableMedia) {
    
    const title = media.tmdb.media_type === "movie" ? media.tmdb.title : media.tmdb.name;

    return `
    <header>
    <h1>${title}</h1>
    <dl class="top-info">
    ${Object.entries({
        rating: media.tmdb.vote_count ? `${media.tmdb.vote_average} / 10 (${formatNumber(media.tmdb.vote_count)})` : "no ratings",
        year: media.tmdb.media_type === "movie" ? media.tmdb.release_date.split("-")[0] : undefined
    }).filter(x => x[1]).map(x => `<dt class="visually-hidden">${x[0]}</dt><dd class="info-segment">${x[1]}</dd>`)
            .join("")
        }
    </dl>
    </header>
    
    <img src="/images/${media.tmdb.poster_path}">
    
    <section>
    ${makeWatchesWidget(media)}
    <dl class="metadata">
    ${Object.entries({
        "Runtime": media.tmdb.media_type === "movie" ?
                formatNumber(media.tmdb.runtime, "m")
                : `${formatNumber(avg(media.tmdb.episode_run_time) * media.tmdb.number_of_episodes, "m")} (${media.tmdb.number_of_episodes} episodes)`,
            "Genre": media.tmdb.genres.map(x => x.name).join("/"),
            "Director": media.tmdb.credits.crew.find(x => x.job == "Director")?.name || undefined,
        "Budget": "budget" in media.tmdb ? formatNumber(media.tmdb.budget) : undefined
        }).filter(x => x[1]).map(x => `<div><dt>${x[0]}</dt><dd>${x[1]}</dd></div>`)
            .join("")
        }
    </dl>
    ${media.tmdb.overview ? `<p>${media.tmdb.overview}</p>` : ""}
    ${makeStreamingWidget(media.tmdb.watch_providers, title)}
    </section>
    `
}

export function avg(nums: number[]) {
    if(nums.length === 0) return 0;
    else return nums.reduce((a,b)=>a+b) / nums.length;
}

export function formatNumber(num: number | null | undefined, unit = "") {
    if (typeof num != "number") return "";

    let numStr = "" + num;
    let r = "";
    for (var i = 0; i < numStr.length; i++) {
        let numToEnd = numStr.length - i;
        if (i > 0 && numToEnd % 3 == 0) r += ",";
        r += numStr[i];
    }
    if (unit) return r + unit;
    else return r;
}

function makeWatchesWidget(media: ViewableMedia) {
    return `<div class="watch-sessions--parent">
    <aside class="watch-sessions">
    <button onclick="addWatch()">
    Watch
    </button>
    ${media.meta.watched && media.meta.watched.length ?
            `<ol>
    ${media.meta.watched.map(x =>
                `<li>${makeWatchItem(x, media.tmdb.media_type, media.mediaId)}</li>`
            )}
    </ol>`
            : `<span class="empty">You haven't watched this before</span>`
        }
    </aside>
    </div>`
}

function makeWatchItem(viewingSession: ViewingSession, type: "movie" | "tv", mediaId: string) {
    let startFmt = formatMediaSection(viewingSession.from, type), endFmt = formatMediaSection(viewingSession.to, type);

    return `
    <h3>${new Date(viewingSession.date).toDateString().substring(4)}</h3>
    <span class="viewed">${startFmt == endFmt ? startFmt : `${startFmt} - ${endFmt}`}</span>
    
    ${(x => x ? `<dl>${x}</dl>` : "")
            (Object.entries(viewingSession.metatags || {}).map(x => `<dt>${x[0]}</dt><dd>${x[1]}</dd>`).join(""))

        }
    
    <a class="edit-watch" href="/media/${mediaId}/watch-session/${viewingSession.id || viewingSession.date}">
    <svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m4.481 15.659c-1.334 3.916-1.48 4.232-1.48 4.587 0 .528.46.749.749.749.352 0 .668-.137 4.574-1.492zm1.06-1.061 3.846 3.846 11.321-11.311c.195-.195.293-.45.293-.707 0-.255-.098-.51-.293-.706-.692-.691-1.742-1.74-2.435-2.432-.195-.195-.451-.293-.707-.293-.254 0-.51.098-.706.293z" fill-rule="nonzero"/></svg>
    </a>
    `
}

function formatMediaSection(section: MediaSection, type: "movie" | "tv") {
    var r: string[] = [];

    if (section) {
        if (section.season !== undefined) r.push("S" + section.season);
        if (section.episode !== undefined) r.push("E" + section.episode);
        if (section.minute !== undefined) r.push(section.minute + "min");
    }

    if (r.length > 0) return r.join(" ");
    else return "Entire " + (type == "movie" ? "movie" : "show");
}

function makeStreamingWidget(watchProviders: TMDBWatchProviderMapByCountry, title: string) {
    if (!watchProviders) return "";

    return `<aside class="watch-providers">
    <h2>Streaming On</h2>
    <ul>
    ${(watchProviders.US && watchProviders.US.flatrate && watchProviders.US.flatrate.length) ?
            watchProviders.US.flatrate.map(x =>
                `<li><img src="/images${x.logo_path}"/>${x.provider_name}</li>`
            ).join("") : `<span class="empty">${title} isn't available for streaming in the U.S.</span>`
        }
    </ul>
    </aside>`
}