const docusign = require("docusign-esign");

function formatString(inputString) {
  var args = Array.prototype.slice.call(arguments, 1);
  return inputString.replace(/{(\d+)}/g, function(match, number) { 
    return typeof args[number] !== 'undefined'
      ? args[number] 
      : match
    ;
  });
}

async function isCFR(accessToken, accountId, basePath) {
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + accessToken);
  let accountsApi = new docusign.AccountsApi(dsApiClient);
  let accountDetails = accountsApi.getAccountInformation(accountId);
  const accountDetailsData = await accountDetails; 
  return accountDetailsData["status21CFRPart11"]
}

module.exports = { formatString, isCFR };