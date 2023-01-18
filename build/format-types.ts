export type iso8601 = iso8601Date | iso8601Datetime;
    
export type iso8601Date = `${number}-${number}-${number}`;
export type iso8601Datetime = `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z`;