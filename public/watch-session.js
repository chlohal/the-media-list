let cache = {};

const MEDIA_ID = window.location.pathname.split("/")[2];
const WATCH_SESSION = window.location.pathname.split("/")[4];

loadMedia(MEDIA_ID);

function loadMedia(mediaId) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/media/id/" + mediaId);
    xhr.onload = function() { renderMedia(JSON.parse(xhr.responseText)) };
    
    xhr.send();
}

function loadWatchSession(media, watchSessionId) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/media/id/" + media.mediaId + "/watch-sessions/id/" + watchSessionId);
    xhr.onload = function () { renderWatchSession(media.tmdb, JSON.parse(xhr.responseText)) };

    xhr.send();
}

/**
 * @param {import("../build/TMDBMedia").TMDBCollectedMedia} tmdb
 * @param {import("../build/ViewableMedia").ViewingSession} watchSession 
 */
function renderWatchSession(tmdb, watchSession) {
    document.querySelector("section").innerHTML = `
    <h3>Watched On ${new Date(watchSession.date).toDateString().substring(4)}</h3>
    <form class="watch-sessions-fromto">
        <fieldset class="section-select">
            <legend>From</legend>
            ${makeSectionSelection(tmdb, watchSession.from, true)}
        </fieldset>
        <fieldset class="section-select">
            <legend>To</legend>
            ${makeSectionSelection(tmdb, watchSession.from, false)}
        </fieldset>
    </form>
    `;
    
    enhanceInputs();
    enhanceSectionSelects();
}

/**
 * 
 * @param {import("../build/TMDBMedia").TMDBCollectedMedia} tmdb 
 * @param {import("../build/ViewableMedia").MediaSection} section 
 */
function makeSectionSelection(tmdb, section, isBeginning) {
    if (!section) section = {};
    
    if(tmdb.media_type == "movie") {
        return makeNumberInput(typeof section.minute === "number" ? section.minute : isBeginning ? 0 : tmdb.runtime, 
            0, tmdb.runtime, "minute"
            ); 
    } else {
        const seasonMin = tmdb.seasons[0].season_number;
        const seasonMax = tmdb.seasons[tmdb.seasons.length - 1].season_number;
        const activeSeasonNumber = typeof section.season === "number" ? section.season : isBeginning ? seasonMin : seasonMax;
        const activeSeason = tmdb.seasons.find(x=>x.season_number == activeSeasonNumber);
        return `
        ${makeNumberInput(activeSeason.season_number, seasonMin, seasonMax, "Season")}
        ${makeNumberInput(
            typeof section.episode === "number" ? section.episode : isBeginning ? 1 : activeSeason.episode_count,
            1, activeSeason.episode_count, "Episode")
        }
        ${makeNumberInput(
            typeof section.minute === "number" ? section.minute : isBeginning ? 0 : Math.max(...tmdb.episode_run_time),
            0, Math.max(...tmdb.episode_run_time), "minute")
        }
        `
    }
}
function makeNumberInput(value, min, max, caption) {
    return `<label class="big-number-input">
            ${caption}
            <span class="relative-wrapper">
                <input type="number" min="${min}" max="${max}" value="${value}">
                <span class="outof">/${max}</span>
            </span>
        </label>`
}

/**
 * 
 * @param {import("../build/ViewableMedia").ViewableMedia} media 
 */
function renderMedia(media) {
    
    cache = media;
    
    document.querySelector("main").innerHTML = `
    <header>
    <h1>${media.tmdb.name || media.tmdb.title}</h1>
    <dl class="top-info">
    ${
    Object.entries({
        rating: media.tmdb.vote_count ? `${media.tmdb.vote_average} / 10 (${formatNumber(media.tmdb.vote_count)})` : "no ratings",
        year: media.tmdb.release_date ? media.tmdb.release_date.split("-")[0] : undefined
    }).filter(x=>x[1]).map(x => `<dt class="visually-hidden">${x[0]}</dt><dd class="info-segment">${x[1]}</dd>`)
    .join("")
    }
    </dl>
    </header>
    
    <img src="/images/${media.tmdb.poster_path}">
    
    <section>
    <h2>Watched On ${3}</h2>
    
    </section>
    `;
    
    
    const watchSession = media.meta.watched && media.meta.watched.find(x => x.id == WATCH_SESSION);
    
    if (watchSession) renderWatchSession(media.tmdb, watchSession);
    else loadWatchSession(cache, MEDIA_ID, WATCH_SESSION);
}

function formatNumber(num, unit) {
    if(typeof num != "number") return "";
    
    let numStr = "" + num;
    let r = "";
    for(var i = 0; i < numStr.length; i++) {
        let numToEnd = numStr.length - i;
        if(i > 0 && numToEnd % 3 == 0) r += ",";
        r += numStr[i];
    }
    if(unit) return r + unit;
    else return r;
}

/**
 * 
 * @param {import("../build/ViewableMedia").ViewableMedia} media 
 */
function makeWatchesWidget(media) {
    return `<div class="watch-sessions--parent">
    <aside class="watch-sessions">
    <button onclick="addWatch()">
    Watch
    </button>
    ${media.meta.watched && media.meta.watched.length ? 
    `<ol>
    ${media.meta.watched.map(x=>
        `<li>${makeWatchItem(x, media.tmdb.media_type, media.tmdb.name || media.tmdb.title)}</li>`
    )}
    </ol>`
    : `<span class="empty">You haven't watched this before</span>`
    }
    </aside>
    </div>`
}

/**
 * 
 * @param {import("../build/ViewableMedia").ViewingSession} viewingSession 
 * @param {string} type
 */
function makeWatchItem(viewingSession, type, title) {
    let startFmt = formatMediaSection(viewingSession.from, type), endFmt = formatMediaSection(viewingSession.to, type);
    
    console.log(startFmt, endFmt);
    
    return `
    <h3>${new Date(viewingSession.date).toDateString().substring(4)}</h3>
    <span class="viewed">${startFmt == endFmt ? startFmt : `${startFmt} - ${endFmt}`}</span>
    
    ${
        (x=>x ? `<dl>${x}</dl>` : "")
        (Object.entries(viewingSession.metatags || {}).map(x=>`<dt>${x[0]}</dt><dd>${x[1]}</dd>`).join(""))
    
    }
    
    <a class="edit-watch" href="/media/${title}/watch-session/${viewingSession.id || viewingSession.date}">
    <svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m4.481 15.659c-1.334 3.916-1.48 4.232-1.48 4.587 0 .528.46.749.749.749.352 0 .668-.137 4.574-1.492zm1.06-1.061 3.846 3.846 11.321-11.311c.195-.195.293-.45.293-.707 0-.255-.098-.51-.293-.706-.692-.691-1.742-1.74-2.435-2.432-.195-.195-.451-.293-.707-.293-.254 0-.51.098-.706.293z" fill-rule="nonzero"/></svg>
    </a>
    `
}

/**
 * 
 * @param {import("../build/ViewableMedia").MediaSection} section 
 */
function formatMediaSection(section, type) {
    var r = [];
    
    
    
    if(section) {
        if (section.season > -1) r.push("S" + section.season);
        if (section.episode > -1) r.push("E" + section.episode);
        if (section.minute > -1) r.push(section.minute + "min");
    }
    
    if(r.length > 0) return r.join(" ");
    else return "Entire " + (type == "movie" ? "movie" : "show");
}

function addWatch() {
    const watchSessions = document.getElementsByClassName("watch-sessions")[0];
    
    let ol;
    if (watchSessions.lastElementChild.tagName == "SPAN") {
        ol = document.createElement("ol");
        watchSessions.removeChild(watchSessions.lastElementChild);
        watchSessions.appendChild(ol);
    } else {
        ol = watchSessions.lastElementChild;
    }
    
    const newLi = document.createElement("li");
    newLi.innerHTML = makeWatchItem({
        date: new Date().toISOString(),
        from: {},
        to: {},
        metatag: {}
    }, cache.media_type, cache.name || cache.title)
    
    ol.insertBefore(newLi, ol.firstElementChild);
}

/**
 * 
 * @param {import("../build/TMDBMedia").TMDBWatchProviderMapByCountry} watchProviders 
 */
function makeStreamingWidget(watchProviders, title) {
    if(!watchProviders) return "";
    
    return `<aside class="watch-providers">
    <h2>Streaming On</h2>
    <ul>
    ${(watchProviders.US && watchProviders.US.flatrate && watchProviders.US.flatrate.length) ? 
    watchProviders.US.flatrate.map(x=>
        `<li><img src="/images${x.logo_path}"/>${x.provider_name}</li>`
        ).join("") : `<span class="empty">${title} isn't available for streaming in the U.S.</span>`
    }
    </ul>
    </aside>`
}