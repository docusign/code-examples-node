const docusign = require('docusign-esign');
const fs = require('fs');
const path = require('path');

const settings = require('../config/appsettings.json');
const { REDIRECT_URI, BASE_PATH, OAUTH_BASE_PATH, PRIVATE_KEY_FILENAME, EXPIRES_IN, SCOPES } = require('./constants');

const TEST_TIMEOUT_MS = 10000;

const apiClient = new docusign.ApiClient({
  basePath: BASE_PATH,
  oAuthBasePath: OAUTH_BASE_PATH
});

const authenticate = async () => {
  try {
    const privateKeyFile = fs.readFileSync(path.resolve(__dirname, PRIVATE_KEY_FILENAME));
    const res = await apiClient.requestJWTUserToken(settings.dsJWTClientId, settings.impersonatedUserGuid, SCOPES, privateKeyFile, EXPIRES_IN);
  
    const accessToken = res.body.access_token;
    apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`);
    const userInfo = await apiClient.getUserInfo(accessToken);
  
    const accountId = userInfo.accounts[0].accountId;
    
    return { accessToken, accountId };
  } catch(error) {
    const body = error.response && error.response.body;

    // Determine the source of the error.
    if (body) {
      if (body.error && body.error === 'consent_required') {
        // The first time you ask for a JWT access token.
        // get DocuSign OAuth authorization url:
        const authorizationUrl = apiClient.getJWTUri(settings.dsJWTClientId, REDIRECT_URI, OAUTH_BASE_PATH);
        
        // open DocuSign OAuth authorization url in the browser, login and grant access
        const consentMessage = `You should grant access by making the following call: ${authorizationUrl}`;
        console.log(consentMessage);
        throw new Error(consentMessage);        
      } else {
        // Consent has been granted. Show status code for DocuSign API error.
        throw new Error(`\nAPI problem: Status code ${error.response.status}, message body:
        ${JSON.stringify(body, null, 4)}\n\n`);
      }
    }
  }
};

const areEqual = (obj1, obj2) => {
  return obj1 == obj2
    || JSON.stringify(obj1) == JSON.stringify(obj2)
    || JSON.parse(JSON.stringify(obj1)) == JSON.parse(JSON.stringify(obj2));
}

module.exports = { TEST_TIMEOUT_MS, authenticate, areEqual }