/**
 * @file
 * Update public/source files
 * @author DocuSign
 */

const path = require('path')
    , fs = require('fs-extra')
    , moment = require('moment')
    , dsConfig = require('../../ds_configuration.js').config
    , sourcePath = path.resolve(__dirname, '../../public/source')
    , gitkeep = '.gitkeep'
    ;

let ghTokenExpiration = null
  , ghJWT = null
  ;

    docPdfBytes = fs.readFileSync(path.resolve(demoDocsPath, pdf1File));

/**
 * Building a GitHub app  https://developer.github.com/apps/building-github-apps/
 *
 */

function ghCheckToken () {
    // refresh/create the gh token as needed.
    let bufferMin = 5
      , noToken = !ghJWT || !ghTokenExpiration
      , now = moment()
      , needToken = noToken || moment(ghTokenExpiration).subtract(
            bufferMin, 'm').isBefore(now)
      ;

    if (noToken) {debug_log('checkToken: Starting up--need a token')}
    if (needToken && !noToken) {debug_log('checkToken: Replacing old token')}

    if (needToken) {
        ghCreateToken()
    }
}

function ghCreateToken() {
    // Create a JWT token for GitHub
    const now =  moment()
        , iat = now.unix()
        , exp = now.add(10, 'm')
        ;
    ghTokenExpiration = exp;
    ghJWT = jwt.sign({ iat: iat, exp: exp, iss:   }, cert, { algorithm: 'RS256'});

}







function start() {



}





start();

