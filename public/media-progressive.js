/**
 * 
 * @param {import("../build/ViewableMedia").ViewingSession} viewingSession 
 * @param {string} type
 */
function makeWatchItem(viewingSession, type, mediaId) {
    let startFmt = formatMediaSection(viewingSession.from, type), endFmt = formatMediaSection(viewingSession.to, type);

    console.log(startFmt, endFmt);

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

/**
 * 
 * @param {import("../build/ViewableMedia").MediaSection} section 
 */
function formatMediaSection(section, type) {
    var r = [];



    if (section) {
        if (section.season > -1) r.push("S" + section.season);
        if (section.episode > -1) r.push("E" + section.episode);
        if (section.minute > -1) r.push(section.minute + "min");
    }

    if (r.length > 0) return r.join(" ");
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
    }, MEDIA_TYPE, MEDIA_ID)

    ol.insertBefore(newLi, ol.firstElementChild);
}