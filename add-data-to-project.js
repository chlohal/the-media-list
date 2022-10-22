const tmdbSearch = require("./tmdb-search");

const TOKEN = process.env.GITHUB_TOKEN;

(async() => {
    const mediaData = await tmdbSearch();
})();