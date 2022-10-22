/**
 * Takes 1 argument in argv. Searches the TMDB API for that string; if there is exactly 1 result or if there is 
 * one result that is exactly the argument, logs its JSON to stdout. If the aforementioned conditions are not fulfilled, 
 * exits with an error.
 */

const movie = process.argv[2];
console.log(movie);

function movieSearch(movie) {

}