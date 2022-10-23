const TOKEN = getToken();

module.exports = async function d4Search(title, tmdbId) {
    if(process.argv[3]) return await getMedia(process.argv[3]);
    else return searchFor(title, tmdbId);
}

async function searchFor(title, tmdbId) {
    const results = await getSearchResults(title);

    const correctResult = results.items.find(x=>x.tmdbId === tmdbId);

    if(!correctResult) {
        console.error("Couldn't find D4 media for " + title);
        return null;
    }

    return await getMedia(correctResult.id);
}

async function getMedia(itemId) {
    return await d4ApiRequest(`https://www.doesthedogdie.com/media/${itemId}`);
}

async function d4ApiRequest(url) {
    const response = await fetch(url, {
        headers: {
            "Accept": "application/json",
            "X-API-KEY": TOKEN
        }
    });

    return await response.json();
}

async function getSearchResults(title) {
    const url = new URL("https://www.doesthedogdie.com/dddsearch");
    url.searchParams.set("q", title);

    return await d4ApiRequest(url);
}

function getToken() {
    try {
        return fs.readFileSync(__dirname + "/token_d4").toString();
    } catch(e) {}

    return process.env.D4_TOKEN;
}