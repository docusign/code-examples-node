const docusign = require('docusign-esign');
const fs = require('fs');
const path = require('path');

const config = require('./testConfig').getConfiguration();
const { REDIRECT_URI, BASE_PATH, OAUTH_BASE_PATH, PRIVATE_KEY_FILENAME, EXPIRES_IN, SCOPES, CLICK_SCOPES, ROOM_SCOPES, ADMIN_SCOPES } = require('./constants');

const TEST_TIMEOUT_MS = 20000;

const apiClient = new docusign.ApiClient({
  basePath: BASE_PATH,
  oAuthBasePath: OAUTH_BASE_PATH
});

const authenticate = async (apiTypes) => {
  try {
    const privateKeyFile = config.privateKey
      ? config.privateKey
      : fs.readFileSync(path.resolve(__dirname, PRIVATE_KEY_FILENAME));

    let scopes = SCOPES;

    if(apiTypes !== undefined) {
      if(apiTypes.includes('click')) {
        scopes = scopes.concat(CLICK_SCOPES);
      }
      if(apiTypes.includes('rooms')) {
        scopes = scopes.concat(ROOM_SCOPES);
      }
      if(apiTypes.includes('admin')) {
        scopes = scopes.concat(ADMIN_SCOPES);
      }
    }

    const res = await apiClient.requestJWTUserToken(config.dsJWTClientId, config.impersonatedUserGuid, scopes, privateKeyFile, EXPIRES_IN);
  
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
        const authorizationUrl = apiClient.getJWTUri(config.dsJWTClientId, REDIRECT_URI, OAUTH_BASE_PATH);
        
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

module.exports = { TEST_TIMEOUT_MS, authenticate, areEqual, config }