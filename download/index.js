const fs = require("fs");
const doesTheDogDieSearch = require("./does-the-dog-die-search");

const tmdbSearch = require("./tmdb-search");

const TOKEN = loadToken();
const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

const TMDB_BASE_IMAGE_URL = "https://image.tmdb.org/t/p/w500"

const PROJECT_NUMBER = 2;

(async() => {
    const issueNumber = process.argv[2] | 0;
    if(!issueNumber) { console.error("No issue number!"); process.exit(1)}

    const ids = await getIssueAndProjectData(issueNumber, PROJECT_NUMBER);


    const metadata = await tmdbSearch(ids.repository.issue.title);

    const triggersPromise = doesTheDogDieSearch(metadata.name || metadata.title, metadata.id);

    const projectItemId = await addIssueToProject(ids.projectV2.id, ids.repository.issue.id);

    const triggers = await triggersPromise;

    const updated = await updateProjectFieldValues(ids.projectV2.id, projectItemId, ids, {
        "Genres": metadata.genres.map(x=> x.name).join(", "),
        "Available On": metadata.watch_providers?.US?.flatrate?.map(x=> x.provider_name).join(", "),
        "TMDB ID": metadata.id,
        "Media Type": metadata.media_type,
        "Airing Status": metadata.media_type == "tv" ? (metadata.status == "Ended" ? "Over" : "Airing") : "N/A",
    }, 
    metadata.genres
        .flatMap(x=>x.name
            .replace(/\bSci-?Fi\b/i, "Science Fiction")
            .split("&")
            .map(y=>
                y.trim()
            )
        ),
`# ${metadata.name || metadata.title}

*${metadata.tagline}*

Average Review: ${metadata.vote_average}/10 (${metadata.vote_count} votes)

${metadata.overview}

![backdrop](${TMDB_BASE_IMAGE_URL}${metadata.poster_path})

Streaming On: ${metadata.watch_providers?.US?.flatrate?.map(x=> x.provider_name).join(", ")}

Cast: ${metadata.credits.cast.map(x=>x.name).join(", ")}

Keywords: ${metadata.keywords.map(x=>x.name).join(", ")}

${triggers ? `
<details>
<summary>Triggers</summary>

${triggers
    .topicItemStats
    .filter(x=> x.yesSum > x.noSum) //voted 'yes'
    .map(x=> //format as a list
        `- ${x.topic.smmwDescription}: ${ 
            x.comments.sort((a,b)=>b.voteSum - a.voteSum) //find best comment
            [0]?.comment //if it exists, get it
            || "(no comment)" //or '(no comment)'
        } `.replace(": (no comment)", "")
    ).join("\n")
}

</details>
` : "Couldn't get trigger data"}
`
    );

    const dataFolder = `${__dirname}/../data/${metadata.id}-${slugify(metadata.name || metadata.title)}`;

    createDirectory(dataFolder);

    fs.writeFileSync(`${dataFolder}/tmdb.json`, JSON.stringify(metadata, null, 2));
    fs.writeFileSync(`${dataFolder}/d4.json`, JSON.stringify(triggers, null, 2));
    
})();

function slugify(str) {
    return ("" + str)
        .replace(/\W+/g, "-")
        .substring(0, 40)
        .replace(/^-/, "")
        .replace(/-$/, "")
        .toLowerCase();
}

function createDirectory(dir) {
    if(!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function getMutationsForUpdatingFieldValues(projectId, projectItemId, fields, updates) {
    let query = ``;

    for(const updKey in updates) {
        query += createMutationFor(projectId, projectItemId, fields[updKey], updates[updKey]);
    }

    return query;
}

async function updateProjectFieldValues(projectId, projectItemId, fieldIdReference, updates, labels, issueBody) {
    const fields = collectFieldsIntoMap(fieldIdReference.projectV2.fields.edges);

    const labelIds = fieldIdReference.repository.labels;
    const issueId = fieldIdReference.repository.issue.id;
    let query = `mutation { 
        ${getMutationForUpdatingIssue(issueId, labelIds, labels, issueBody, projectId)}
        ${getMutationsForUpdatingFieldValues(projectId, projectItemId, fields, updates)} 
    }`;

    const mutationRequest = await sendGraphQl(query);

    if("errors" in mutationRequest) {
        console.error(mutationRequest);
        throw new Error("Couldn't update!");
    }
}

function getMutationForUpdatingIssue(issueId, labelReference, selectLabels, body, projectId) {
    const labelIds = getLabelIds(labelReference, selectLabels);

    return `updtIssue: updateIssue(input: {
        id: "${issueId}"
        assigneeIds: []
        body: ${JSON.stringify(body) }
        labelIds: ${ JSON.stringify(labelIds) }
    }) {
        issue {
            id
        }
    }`
}

function getLabelIds(labelReference, selectLabels) {
    const labelMap = Object.fromEntries(
        labelReference.edges.map(x=>[x.node.name, x.node.id])
    );

    const labelIds = selectLabels.map(x=> {
        if(x in labelMap) return labelMap[x];
        else throw new Error("No such label '" + x + "'");
    });

    return labelIds;
}

function createMutationFor(projectId, projectItemId, field, value) {
    if(field.__typename == "ProjectV2SingleSelectField") {
        return createSingleSelectMutationFor(projectId, projectItemId, field, value);
    } else {
        return createGenericMutationFor(projectId, projectItemId, field, value);
    }
}

function makeUpdateId(name) {
    return `upd_${name.replace(/\W+/g, "_").toLowerCase()}_${Math.random().toString(16).substring(2)}`;
}

function createSingleSelectMutationFor(projectId, projectItemId, field, value) {

    let option = field.options.find(x=> x.name == value);

    if(!option) console.error("Field " + field.name + " has no option " + value);

    let optionId = option.id;

    return `${makeUpdateId(field.name)}: updateProjectV2ItemFieldValue(input: {
        projectId: "${projectId}",
        itemId: "${projectItemId}"
        fieldId: "${field.id}",
        value: {
            singleSelectOptionId: "${optionId}"
        }
    }) {
        projectV2Item {
            id
        }
    }`
}

function createGenericMutationFor(projectId, projectItemId, field, value) {
    return `${makeUpdateId(field.name)}: updateProjectV2ItemFieldValue(input: {
        projectId: "${projectId}",
        itemId: "${projectItemId}"
        fieldId: "${field.id}",
        value: {
            text: ${ JSON.stringify("" + value) }
        }
    }) {
        projectV2Item {
            id
        }
    }`
}

function collectFieldsIntoMap(fields) {
    const obj = {};

    for(const field of fields) {
        obj[field.node.name] = field.node;
    }

    return obj;
}

async function addIssueToProject(projectId, issueId) {
    const gqlReply = await sendGraphQl(`
    mutation {
        addProjectV2ItemById(input: {
          clientMutationId: "Action",
          projectId: "${projectId}",
          contentId: "${issueId}"
        }) {
          item {
            id
            
          }
        }
      }
      `);

    return gqlReply.data.addProjectV2ItemById.item.id;
}

async function getIssueAndProjectData(issueNumber, projectNumber) {
    const gqlReply = await sendGraphQl(`query {
        viewer { 
            repository(name:"the-media-list") {
                id
                issue(number: ${issueNumber}) {
                    id
                    title
                }
                labels(first: 29) {
                    edges {
                        node {
                            id
                            name
                        }
                    }
                }
            }
            projectV2(number: ${projectNumber}) {
                fields(first: 20) {
                    edges{
                        node {
                            __typename
                            ...on ProjectV2FieldCommon {
                                id
                                name
                            }
                            ...on ProjectV2SingleSelectField {
                                options {
                                    id
                                    name
                                }
                            }
                        }
                    }
                }
                id
            }
        }
    }`);

    return gqlReply.data.viewer;
}

async function sendGraphQl(queryContent) {
    const req = await fetch(GITHUB_GRAPHQL_URL, {
        headers: {
            "Authorization": "Bearer " + TOKEN
        },
        method: "POST",
        body: JSON.stringify({ query: queryContent })
    });

    const json = await req.json();
    
    if(json.data) {
        return json;
    } else {
        console.error(json);
        throw new Error("Bad GQL Reply");
    } 
}

function loadToken() {
    try {
        return fs.readFileSync(__dirname + "/../token_gh").toString();
    } catch(e) {}
    return process.env.GITHUB_TOKEN;
}