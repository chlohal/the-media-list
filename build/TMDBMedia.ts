import { iso8601, iso8601Date } from "./format-types.js";

export const TMDB_BASE_IMAGE_URL = "https://image.tmdb.org/t/p/w500"

export type TMDBCollectedMedia = TMDBMedia & {
    credits: TMDBCredits,
    watch_providers: TMDBWatchProviderMapByCountry,
    keywords: TMDBIdentifiedName[],
    external_ids: TMDBExternalIDs
}

export type TMDBMedia = (TMDBMovie & { "media_type": "movie" }) | (TMDBShow & { "media_type": "tv" });

export type TMDBShow = {
    backdrop_path: string | null,
    created_by: TMDBPerson[],
    episode_run_time: number[],
    first_air_date: string,
    genres: TMDBIdentifiedName[],
    homepage: string,
    id: number,
    in_production: boolean,
    languages: string[],
    last_air_date: string,
    last_episode_to_air: TMDBEpisode,
    name: string,
    next_episode_to_air: null,
    networks: TMDBProductionCompany[],
    number_of_episodes: number,
    number_of_seasons: number,
    origin_country: string[],
    original_language: string,
    original_name: string,
    overview: string,
    popularity: number,
    poster_path: string | null,
    production_companies: TMDBProductionCompany[],
    production_countries: TMDBProductionCountry[],
    seasons: TMDBSeason[],
    spoken_languages: TMDBSpokenLanguage[],
    status: string,
    tagline: string,
    type: string,
    vote_average: number,
    vote_count: number
}

export type TMDBSeason = {
    air_date: string,
    episode_count: number,
    id: number,
    name: string,
    overview: string,
    poster_path: string,
    season_number: number
}

export type TMDBEpisode = {
    air_date: string,
    episode_number: number,
    id: number,
    name: string,
    overview: string,
    production_code: string,
    season_number: number,
    still_path: string | null,
    vote_average: number,
    vote_count: number
}

export type TMDBMovie = {
    adult: boolean,
    backdrop_path: string | null,
    belongs_to_collection: {
        id: number,
        name: string,
        poster_path: string | null,
        backdrop_path: string | null
    } | null,
    budget: number,
    genres: TMDBIdentifiedName[],
    homepage: string,
    id: number,
    imdb_id: `tt${number}` | null,
    original_language?: string,
    original_title?: string,
    overview: string | null,
    popularity: number,
    poster_path: string | null,
    production_companies: TMDBProductionCompany[],
    production_countries: TMDBProductionCountry[],
    release_date: iso8601Date,
    revenue: number,
    runtime: number | null,
    spoken_languages: TMDBSpokenLanguage[],
    status: "Rumored" | "Planned" | "In Production" | "Post Production" | "Released" | "Canceled",
    tagline: string | null,
    title: string,
    video: boolean,
    vote_average: number,
    vote_count: number
}

export type TMDBSpokenLanguage = {
    iso_639_1: string,
    name: string,
    english_name?: string
}

type TMDBProductionCountry = {
    iso_3166_1: string,
    name: string
}

type TMDBProductionCompany = {
    id: number,
    logo_path: string | null,
    name: string,
    origin_country: string
}

export type TMDBKeywords = {
    id: number,
    keywords: TMDBIdentifiedName[]
}

export type TMDBIdentifiedName = {
    id: number,
    name: string
}

export type TMDBCredits = {
    id: number,
    cast: TMDBActor[],
    crew: TMDBCreditedPerson[]
}

export type TMDBActor = TMDBCreditedPerson & {
    cast_id: number,
    character: string,
    order: number
}

export type TMDBPerson = TMDBIdentifiedName & {
    gender: number | null,
    profile_path: string | null
    credit_id: string
}

export type TMDBCreditedPerson = TMDBPerson & {
    adult: boolean,
    known_for_department: string,
    original_name: string,
    popularity: number,
    department: string,
    job: string,
}

export type TMDBExternalIDs = {
    id: number,
    imdb_id: string | null,
    facebook_id: string | null,
    instagram_id: string | null,
    twitter_id: string | null
}

export type TMDBWatchProviders = {
    id: number,
    results: TMDBWatchProviderMapByCountry
}

type country = "AF" | "AX" | "AL" | "DZ" | "AS" | "AD" | "AO" | "AI" | "AQ" | "AG" | "AR" | "AM" | "AW" | "AU" | "AT" | "AZ" | "BS" | "BH" | "BD" | "BB" | "BY" | "BE" | "BZ" | "BJ" | "BM" | "BT" | "BO" | "BQ" | "BA" | "BW" | "BV" | "BR" | "IO" | "BN" | "BG" | "BF" | "BI" | "CV" | "KH" | "CM" | "CA" | "KY" | "CF" | "TD" | "CL" | "CN" | "CX" | "CC" | "CO" | "KM" | "CD" | "CG" | "CK" | "CR" | "CI" | "HR" | "CU" | "CW" | "CY" | "CZ" | "DK" | "DJ" | "DM" | "DO" | "EC" | "EG" | "SV" | "GQ" | "ER" | "EE" | "SZ" | "ET" | "FK" | "FO" | "FJ" | "FI" | "FR" | "GF" | "PF" | "TF" | "GA" | "GM" | "GE" | "DE" | "GH" | "GI" | "GR" | "GL" | "GD" | "GP" | "GU" | "GT" | "GG" | "GN" | "GW" | "GY" | "HT" | "HM" | "VA" | "HN" | "HK" | "HU" | "IS" | "IN" | "ID" | "IR" | "IQ" | "IE" | "IM" | "IL" | "IT" | "JM" | "JP" | "JE" | "JO" | "KZ" | "KE" | "KI" | "KP" | "KR" | "KW" | "KG" | "LA" | "LV" | "LB" | "LS" | "LR" | "LY" | "LI" | "LT" | "LU" | "MO" | "MK" | "MG" | "MW" | "MY" | "MV" | "ML" | "MT" | "MH" | "MQ" | "MR" | "MU" | "YT" | "MX" | "FM" | "MD" | "MC" | "MN" | "ME" | "MS" | "MA" | "MZ" | "MM" | "NA" | "NR" | "NP" | "NL" | "NC" | "NZ" | "NI" | "NE" | "NG" | "NU" | "NF" | "MP" | "NO" | "OM" | "PK" | "PW" | "PS" | "PA" | "PG" | "PY" | "PE" | "PH" | "PN" | "PL" | "PT" | "PR" | "QA" | "RE" | "RO" | "RU" | "RW" | "BL" | "SH" | "KN" | "LC" | "MF" | "PM" | "VC" | "WS" | "SM" | "ST" | "SA" | "SN" | "RS" | "SC" | "SL" | "SG" | "SX" | "SK" | "SI" | "SB" | "SO" | "ZA" | "GS" | "SS" | "ES" | "LK" | "SD" | "SR" | "SJ" | "SE" | "CH" | "SY" | "TW" | "TJ" | "TZ" | "TH" | "TL" | "TG" | "TK" | "TO" | "TT" | "TN" | "TR" | "TM" | "TC" | "TV" | "UG" | "UA" | "AE" | "GB" | "UM" | "US" | "UY" | "UZ" | "VU" | "VE" | "VN" | "VG" | "VI" | "WF" | "EH" | "YE" | "ZM" | "ZW";

export type TMDBWatchProviderMapByCountry = Record<country, {
    link: string,
    flatrate: TMDBWatchProviderEntry[],
    rent: TMDBWatchProviderEntry[]
    buy: TMDBWatchProviderEntry[]
}>

export type TMDBWatchProviderEntry = {
    display_priority: number,
    logo_path: string,
    provider_id: number,
    provider_name: string
}