const docusign = require('docusign-esign');
const fs = require('fs');
const path = require('path');

const settings = require('../config/appsettings.json');
const { REDIRECT_URI, BASE_PATH, OAUTH_BASE_PATH, PRIVATE_KEY_FILENAME, EXPIRES_IN, signerClientId, pingUrl, returnUrl, TEST_PDF_FILE, SCOPES } = require('./constants');

const apiClient = new docusign.ApiClient({
  basePath: BASE_PATH,
  oAuthBasePath: OAUTH_BASE_PATH
});

const authenticate = async () => {
  // IMPORTANT NOTE:
  // the first time you ask for a JWT access token, you should grant access by making the following call
  // get DocuSign OAuth authorization url:
  
  const authorizationUrl = apiClient.getJWTUri(settings.dsJWTClientId, REDIRECT_URI, OAUTH_BASE_PATH);
  // open DocuSign OAuth authorization url in the browser, login and grant access
  console.log('OAuth authorization url:', authorizationUrl);
  // END OF NOTE

  const privateKeyFile = fs.readFileSync(path.resolve(__dirname, PRIVATE_KEY_FILENAME));
  const res = await apiClient.requestJWTUserToken(settings.dsJWTClientId, settings.impersonatedUserGuid, SCOPES, privateKeyFile, EXPIRES_IN);

  const accessToken = res.body.access_token;
  apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`);
  const userInfo = await apiClient.getUserInfo(accessToken);

  const accountId = userInfo.accounts[0].accountId;
  const baseUri = userInfo.accounts[0].baseUri;
  const accountDomain = baseUri.split('/v2');
  apiClient.setBasePath(`${accountDomain[0]}/restapi`);
  
  return { accessToken, accountId, baseUri };
};

const getEnvelopeArgs = () => {
  return {
    signerEmail: settings.signerEmail,
    signerName: settings.signerName,
    signerClientId: signerClientId,
    dsReturnUrl: returnUrl,
    dsPingUrl: pingUrl,
    docFile: path.resolve(TEST_PDF_FILE),
  };
}

module.exports = { authenticate, getEnvelopeArgs }