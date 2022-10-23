const TOKEN = getToken();

module.exports = async function d4Search(title, tmdbId) {
    const results = await getSearchResults(title);

    const correctResult = results.items.find(x=>x.tmdbId === tmdbId);

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