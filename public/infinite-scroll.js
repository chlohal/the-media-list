const ELEM_HEIGHT_EM = 10;
let ELEM_PER_PAGE = (localStorage.getItem("ELEM_PER_PAGE") | 0) || 50;

const main = document.getElementById("main");

const ul = main.querySelector("ul");

const cache = []

let pagesLoaded = {};
let pagesCount = Infinity;

requestAnimationFrame(loadFocusedPage);

requestAnimationFrame(function anim() {
    const lis = getVisibleLiElements();
    
    applyFade(lis);
    
    checkScroll(lis);
    
    requestAnimationFrame(anim);
});

function loadFocusedPage() {
    console.log(window.scrollY);
    const top = window.scrollY - ul.clientTop;
    
    const elem = (top / getElemHeightPx()) | 0;
    const page = (elem / ELEM_PER_PAGE) | 0;
    
    if (!(page in pagesLoaded)) loadPage(page);
}

function checkScroll(visibleLis) {
    let testLow = visibleLis.idx - visibleLis.num;
    if(testLow >= 0 && !(testLow in cache)) loadPage(Math.floor(testLow / ELEM_PER_PAGE))
    
    let testHigh = visibleLis.idx + visibleLis.num * 2;
    if (!(testHigh in cache)) loadPage(Math.floor(testHigh / ELEM_PER_PAGE));
}

function applyFade(visibleLis) {
    const top = visibleLis.top;
    const elemHeight = visibleLis.elemHeight;
    const height = window.innerHeight;
    const middle = visibleLis.top + height / 2;
    
    for (let i = visibleLis.elems.length - 1; i >= 0; i--) {        
        attachLi(visibleLis.elems[i]);
    }
    
    if (visibleLis.idx > 0 && visibleLis.elems.length > 0) detachLi(visibleLis.elems[0]);
    if (visibleLis.idx + visibleLis.num < cache.length) detachLi(visibleLis.elems[visibleLis.elems.length - 1]);
}

function attachLi(cacheElement) {
    if(!cacheElement.visible) {
        cacheElement.visible = true;
        
        const next = cache[cacheElement.index + 1];

        if (next && next.visible) {
            ul.insertBefore(cacheElement.li, next.li);
        } else {
            ul.appendChild(cacheElement.li);
        }
    }
}

function detachLi(cacheElement) {
    if(cacheElement.visible) {
        cacheElement.visible = false;
        cacheElement.li.parentElement.removeChild(cacheElement.li);
    }
}

function getVisibleLiElements() {
    let top = window.scrollY - ul.clientTop;
    const elemHeight = getElemHeightPx();
    const idx = Math.max(0, ((top / elemHeight) | 0) - 1);
    const num = (Math.ceil(window.innerHeight / elemHeight) | 0) + 3;
    
    
    return {
        top: top,
        elemHeight: elemHeight,
        idx: idx,
        num: num,
        elems: cache.slice(idx, idx + num)
    }
}

function getElemHeightPx() {
    const li = ul.firstElementChild;
    if(li) return li.offsetHeight;
    
    const testLi = document.getElementById("height-detect");
    return testLi.offsetHeight;
}

function loadPage(pageNum) {
    pageNum |= 0;
    
    if (pageNum in pagesLoaded) return false;
    if (pageNum < 0) return false;
    if (pageNum > pagesCount) return false;
    
    pagesLoaded[pageNum] = true;
    
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/media/pages/" + pageNum);
    xhr.onload = function() { renderPage(JSON.parse(xhr.responseText)) }
    xhr.send();
}

function rememberGlobals(page) {
    ELEM_PER_PAGE = page.size;
    localStorage.setItem("ELEM_PER_PAGE", page.size);
    
    localStorage.setItem("ELEM_TOTAL_COUNT", page.total);
    
    document.getElementById("item-counter").textContent = page.total;
}

function renderPage(page) {
    pagesCount = Math.floor(page.total / page.size);
    
    rememberGlobals(page);
    
    ul.style.height = page.total * ELEM_HEIGHT_EM + "em";
    
    const pageBaseIndex = page.index * page.size;

    for (let i = page.media.length - 1; i >= 0; i--) {
        const globalIndex = pageBaseIndex + i;
        const li = renderMedia(page.media[i], globalIndex);
        cache[globalIndex] = { li: li, index: globalIndex };
        
        attachLi(cache[globalIndex]);
    }
}

function renderMedia(media, globalIndex) {
    let li = document.createElement("li");
    li.classList.add("media-item");
    
    let link = document.createElement("a");
    link.href = "/media/" + media.mediaId;
    
    let img = document.createElement("img");
    img.src = media.poster;
    link.appendChild(img);
    
    let title = document.createElement("h2");
    title.textContent = media.title;
    link.appendChild(title);
    
    li.appendChild(link);
    
    li.style.top = globalIndex * 10 + "em";
    
    return li;
}