/**
 * @file
 * Update public/source files
 * @author DocuSign
 */

const path = require('path')
    , fs = require('fs')
    , moment = require('moment')
    , request = require('request-promise-native')
    , jwt = require('jsonwebtoken')
    , sourceDirPath = path.resolve(__dirname, '../../public/source')
    , docOptions = require('../../config/documentOptions.json')
    , docNames = require('../../config/documentNames.json')
    , github = require('../../config/github.json')
    ;

let ghTokenExpiration = null
  , ghAccessToken = null
  , tallyNoExamples = []
  ;

/**
 * Building a GitHub app  https://developer.github.com/apps/building-github-apps/
 *
 */

async function ghCheckToken () {
    // refresh/create the gh token as needed.
    let bufferMin = 5
      , noToken = !ghAccessToken || !ghTokenExpiration
      , now = moment()
      , needToken = noToken || moment(ghTokenExpiration).subtract(
            bufferMin, 'm').isBefore(now)
      ;

    if (noToken) {log('checkToken: Starting up--need a token')}
    if (needToken && !noToken) {log('checkToken: Replacing old token')}
    if (needToken) {await ghCreateToken()}
}

async function ghCreateToken() {
    // Get an accessToken for GitHub...
    // Step 1. Create a JWT token for GitHub
    const now =  moment()
        , iat = now.unix()
        , exp = now.add( (9 * 60) + 30, 's').unix()
        , ghJWT = jwt.sign({ iat: iat, exp: exp,
                iss: github.AppId  }, github.PrivateKey,
                { algorithm: 'RS256'})
        , url = `${github.ApiUrl}app/installations/${github.InstallationId}/access_tokens`
        , headers = {Accept: 'application/vnd.github.machine-man-preview+json',
                     'User-Agent': github.UserAgent}
        , rawResults = await ghApi (url, headers, ghJWT, 'POST')
        , results = JSON.parse(rawResults)
        ;

    ghAccessToken = results.token;
    ghTokenExpiration = moment(results.expires_at);
    log("Received access token");
}

async function ghApi(url, headers, token = null, op = 'GET') {
    const authToken = token ? token : ghAccessToken;
    let result;
    try {
        result = await request({
            method: op,
            uri: url,
            headers: headers,
            auth: {bearer: authToken}
        });
        // log('Good response: ' + result);
        return result;
    } catch (e) {
        log ('GitHub API Error: ' + JSON.stringify(e, null, 4))
        return false;
    }
}

async function ghGetFile(owner, repo, path) {
    // Best way to download GitHub content: https://stackoverflow.com/a/49818900/64904
    // See https://developer.github.com/v3/repos/contents/
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
        , headers = {Accept: 'application/vnd.github.v3.raw',
                     'User-Agent': github.UserAgent}
        ;
    let results;
    await ghCheckToken();
    results = await ghApi(url, headers);
    return results;
}

function deleteSourceDir() {
    // Delete all files except for .gitkeep
    // See https://stackoverflow.com/a/42182416/64904
    const directory = sourceDirPath
        , gitkeep = '.gitkeep'
        , files = fs.readdirSync(directory);

    for (const file of files) {
        if (file == gitkeep) {
            continue;
        }
        fs.unlinkSync(path.join(directory, file));
    }
}

async function doLang(item) {
    let fileNames = docNames[item.langCode];
    for (var eg in fileNames) {
        const fileName = fileNames[eg];
        log ("  " + fileName);
        await process (item, fileName);
    }
}

async function process(item, fileName){
    // Fetch and process the file
    let contents = await ghGetFile(item.owner, item.repo, item.pathPrefix + fileName);
    if (!contents) {
        // Wait and try one more time
        log ("\n\n*** Retrying the file fetch in 5 seconds...\n");
        const timeThen = new Date();
        while ((new Date.now()) - timeThen < 5000) { /* pause */ }
        contents = await ghGetFile(item.owner, item.repo, item.pathPrefix + fileName);
    }
    results = findExample(contents);
    if (!results.foundEg) {
        tallyNoExamples.push(fileName)
    }
    fs.appendFileSync(`${sourceDirPath}/${fileName}`, results.data, {flag: 'wx'});
}

function findExample (source) {
    // Return just the example from within the file.
    // If no markers then return entire file
    const start = "***DS.snippet.0.start",
          end   = "***DS.snippet.0.end";
    let out = [],
        foundStart = false;

    function rmWhitespace() {
        // remove leading spaces/tabs
        const re = /^\s*/
            , reResults = re.exec(out[0])
            , rmString = reResults && reResults[0].length > 0 ? reResults[0] : false;

        if (rmString) {
            const rmLength = rmString.length;
            out = out.map( line => {
                if (line.indexOf(rmString) === 0) {
                    return line.substring(rmLength, line.length)
                } else {
                    return line
                }
            })
        }
    }

    source = source.split("\n");
    for (let line of source) {
        const foundEnd = foundStart && line.indexOf(end) > -1;
        if (foundStart && foundEnd) {
            // all done
            break
        } else if (foundStart) {
            // In the middle
            out.push(line);
            continue;
        } else if (!foundStart && line.indexOf(start) > -1) {
            // found start
            foundStart = true;
            continue;
        }
    };

    if (foundStart) {
        // remove leading spaces/tabs
        rmWhitespace();
        // return just the example
        return {data: out.join("\n"), foundEg: foundStart}
    } else {
        // Never found the example
        return {data: source.join("\n"), foundEg: foundStart}
    }
}


function log(s) {
    console.log(s)
}


async function start() {
    await ghCheckToken();
    deleteSourceDir();
    for (const item of docOptions) {
        log (`${item.name} examples: `);
        await doLang(item);
    }
    log (`\nFiles which did not include the example markers:\n${tallyNoExamples.join("\n")}`);
    log ("Done\n");
}

start();
