const fs = require("fs");

/**
 * Takes 1 argument in argv. Searches the TMDB API for that string; logs the JSON of the first result.
 */

const TMDB_TOKEN = getToken();

module.exports = async function(search) {
    const searchResult = await movieSearch(search);

    const {id, media_type} = searchResult;

    const fullJSON = await tmdbApiRequest(`${media_type}/${id}`, {
        append_to_response: ["watch/providers", "keywords"]
    });

    fullJSON.media_type = media_type;

    console.log(fullJSON);

    return fullJSON;
}

function getToken() {
    try {
        return fs.readFileSync(__dirname + "/token_tmdb").toString();
    } catch(e) {}

    return process.env.TMDB_TOKEN;
}

async function tmdbApiRequest(path, options) {
    const url = new URL(path, "https://api.themoviedb.org/3/");
    url.searchParams.set("api_key", TMDB_TOKEN);
    for(const param in options) {
        url.searchParams.set(param, options[param]);
    }

    const responseText = await (await fetch(url)).text();
    const responseObjects = scanJSONObjects(responseText);

    if(responseObjects.length == 1) return responseObjects[0];

    let response = responseObjects[0];
    let subrequests = options.append_to_response.split(",");

    for(let i = 1; i < responseObjects.length; i++) {
        let subreq = subrequests[i - 1];
        response[subreq] = responseObjects[i];
    }

    return response;
}

/**
 * Scans through a text that contains one or more concatenated JSON objects. 
 * Returns an array of them.
 * @param {string} text text to search through
 * @returns {object[]} all objects in the source text
 */
function scanJSONObjects(text) {
    const objects = [];

    let curlyDepth = 0, inQuotes = false, escaping = false, objectStartIndex = 0;
    //scan through the text; look for the end of each JSON object.
    //when we find it, parse it and add it to the list of JSON objects.
    for(let i = 0; i < text.length; i++) {
        const char = text[i];
        if(escaping) {
            escaping = false;
            continue;
        }
        if(char == "\\") {
            escaping = true;
            continue;
        }

        if(char == "\"") {
            inQuotes = !inQuotes;
            continue;
        }

        if(!inQuotes) {
            if(char == "{") curlyDepth++;
            if(char == "}") curlyDepth--;
            
            if(char == "}" && curlyDepth == 0) {
                objects.push(JSON.parse(text.substring(objectStartIndex, i + 1)));
                objectStartIndex = i + 1;
            }
        }
    }
    return objects;
}

async function movieSearch(search) {

    const yearExec = /\((\d+)\)/.exec(search);
    let year;
    if(yearExec) {
        year = yearExec[1];
        search = search.replace(yearExec[0], "");
    }

    const searchResults = await tmdbApiRequest(`search/multi`, {
        query: search
    }); 

    if(!year) return searchResults.results[0];

    for(const searchResult of searchResults.results) {
        if(searchResult.release_date.startsWith(year + "-")) {
            return searchResult;
        }
    }

    return null;
}