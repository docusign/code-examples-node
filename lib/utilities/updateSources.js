/**
 * @file
 * Update public/source files
 * @author DocuSign
 */

const path = require('path')
    , fs = require('fs-extra')
    , moment = require('moment')
    , request = require('request-promise-native')
    , jwt = require('jsonwebtoken')
    , dsConfig = require('../../ds_configuration.js').config
    , sourcePath = path.resolve(__dirname, '../../public/source')
    , gitkeep = '.gitkeep'
    , ghApiUrl = 'https://api.github.com/'
    , ghPreviewHeader = {Accept: 'application/vnd.github.machine-man-preview+json',
                  'User-Agent': dsConfig.ghUserAgent}
    ;

let ghTokenExpiration = null
  , ghAccessToken = null

  ;


    // docPdfBytes = fs.readFileSync(path.resolve(demoDocsPath, pdf1File));

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

    if (needToken) {
        await ghCreateToken()
    }
}

async function ghCreateToken() {
    // Get an accessToken for GitHub...
    // Step 1. Create a JWT token for GitHub
    const now =  moment()
        , iat = now.unix()
        , exp = now.add( (9 * 60) + 30, 's').unix()
        , ghJWT = jwt.sign({ iat: iat, exp: exp,
                iss: dsConfig.gitHubAppId  }, dsConfig.gitHubPrivateKey,
                { algorithm: 'RS256'})
        , ghInstallationId = 537832
        , url = `${ghApiUrl}app/installations/${ghInstallationId}/access_tokens`
        , headers = {Accept: 'application/vnd.github.machine-man-preview+json',
                     'User-Agent': dsConfig.ghUserAgent}
        , rawResults = await ghApi (url, headers, ghJWT, 'POST')
        , results = JSON.parse(rawResults)
        ;

    // Test the JWT:
    // const results = await ghApi(ghApiUrl + 'app', ghPreviewHeader, ghJWT);

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

function rawUrl(url) {
    // Calculate the github raw url based on the directory url
    // Example
    //  githubExampleUrl:            'https://github.com/docusign/eg-03-node-auth-code-grant/tree/master/lib/examples/',
    //  gitHubRawUrl: 'https://raw.githubusercontent.com/docusign/eg-03-node-auth-code-grant/master/lib/examples/
    let raw = url.replace ('https://github.com', 'https://raw.githubusercontent.com')
                 .replace ('/tree/', '/');
    return raw;
}

async function ghGetFile(owner, repo, path) {
    // See https://developer.github.com/v3/repos/contents/
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
        , headers = {Accept: 'application/vnd.github.v3.raw',
                     'User-Agent': dsConfig.ghUserAgent}
        ;
    let results;
    results = await ghApi(url, headers);
    return results;
}


function log(s) {
    console.log(s)
}



async function start() {
    await ghCheckToken();
    // Best way to download GitHub content: https://stackoverflow.com/a/49818900/64904
    let results = await ghGetFile('docusign', 'eg-03-php-auth-code-grant',
        'src/EG001EmbeddedSigning.php');
    log ("\nFile results:\n" + results + "\n\n");
}





start();

