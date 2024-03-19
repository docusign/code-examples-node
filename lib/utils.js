const docusign = require('docusign-esign');
const axios = require('axios');
const { URL } = require('url');
const querystring = require('querystring');

function formatString(inputString) {
  var args = Array.prototype.slice.call(arguments, 1);
  return inputString.replace(/{(\d+)}/g, function(match, number) {
    return typeof args[number] !== 'undefined'
      ? args[number]
      : match
    ;
  });
}

const API_TYPES = {
  ESIGNATURE: 'eSignature',
  MONITOR: 'Monitor',
  CLICK: 'Click',
  ROOMS: 'Rooms',
  ADMIN: 'Admin',
  CONNECT: 'Connect',
  MAESTRO: 'Maestro',
};

async function isCFR(accessToken, accountId, basePath) {
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + accessToken);
  let accountsApi = new docusign.AccountsApi(dsApiClient);
  let accountDetails = accountsApi.getAccountInformation(accountId);
  const accountDetailsData = await accountDetails;
  return accountDetailsData['status21CFRPart11'];
}

async function makePostRequest(url, body, options = {}) {
  const response = await axios.post(url, body, { ...options });

  return response.data;
}

function getParameterValueFromUrl(urlString, paramName) {
  const parsedUrl = new URL(urlString);
  const queryParams = querystring.parse(parsedUrl.search.slice(1));

  return queryParams[paramName];
}

module.exports = { formatString, isCFR, API_TYPES, makePostRequest, getParameterValueFromUrl };
