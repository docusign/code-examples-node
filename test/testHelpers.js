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

const areEqual = (obj1, obj2) => {
  return obj1 == obj2
    || JSON.stringify(obj1) == JSON.stringify(obj2)
    || JSON.parse(JSON.stringify(obj1)) == JSON.parse(JSON.stringify(obj2));
}

const getToken = async function _getToken() {
  // Data used
  // dsConfig.dsClientId
  // dsConfig.impersonatedUserGuid
  // dsConfig.privateKey
  // dsConfig.dsOauthServer
  const privateKeyFile = fs.readFileSync(path.resolve(__dirname, PRIVATE_KEY_FILENAME));

  const jwtLifeSec = 10 * 60, // requested lifetime for the JWT is 10 min
      dsApi = new docusign.ApiClient();
  dsApi.setOAuthBasePath(OAUTH_BASE_PATH); // it should be domain only.
  const results = await dsApi.requestJWTUserToken(settings.dsClientId,
    settings.impersonatedUserGuid, SCOPES, privateKeyFile,
      jwtLifeSec);

  return {
      accessToken: results.body.access_token,
  };
}

const getUserInfo = async function _getUserInfo(accessToken){
  // Data used:
  // dsConfig.targetAccountId
  // dsConfig.dsOauthServer
  // DsJwtAuth.accessToken

  const dsApi = new docusign.ApiClient()
      , targetAccountId = settings.targetAccountId
      , baseUriSuffix = '/restapi';

  dsApi.setOAuthBasePath(OAUTH_BASE_PATH); // it have to be domain name
  const results = await dsApi.getUserInfo(accessToken);

  let accountInfo;
  if (!Boolean(targetAccountId)) {
      // find the default account
      accountInfo = results.accounts.find(account =>
          account.isDefault === "true");
  } else {
      // find the matching account
      accountInfo = results.accounts.find(account => account.accountId == targetAccountId);
  }
  if (typeof accountInfo === 'undefined') {
      throw new Error (`Target account ${targetAccountId} not found!`);
  }

  const accountId = accountInfo.accountId;
  const basePath = accountInfo.baseUri + baseUriSuffix;
  return {
      accountId,
      basePath
  }
}

module.exports = { authenticate, areEqual, getToken, getUserInfo }