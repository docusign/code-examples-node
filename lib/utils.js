const fs = require('fs-extra');
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
  WEBFORMS: 'WebForms',
  NOTARY: 'Notary',
  CONNECTED_FIELDS: 'ConnectedFields',
  NAVIGATOR: 'Navigator',
  MAESTRO: 'Maestro',
  WORKSPACES: 'Workspaces',
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

function replaceTemplateId(filePath, templateId) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/template-id/g, templateId);
  fs.writeFileSync(filePath, content, 'utf8');
}

function setItem(storage, name, value) {
  if (!storage || !name) {
    return null;
  }

  storage.set(name, value);
}

function getItem(storage, name) {
  if (!storage || !name) {
    return null;
  }

  return storage.get(name);
}

module.exports = { formatString, isCFR, API_TYPES, makePostRequest, getParameterValueFromUrl, replaceTemplateId, setItem, getItem };
