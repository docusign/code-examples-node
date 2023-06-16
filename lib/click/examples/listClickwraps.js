/**
 * @file
 * Example 4: Get list of elastic templates
 * @author DocuSign
 */

const docusignClick = require("docusign-click");

/**
 * Get list of elastic templates
 * @param {Object} args Arguments for creating elastic templates
 * @return {Object} The object with value of clickwrapId or error
 */
const getClickwraps = async (args) => {
  // Call the Click API. Create Click API client
  //ds-snippet-start:Click4Step2
  const dsApiClient = new docusignClick.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  //ds-snippet-end
  //ds-snippet-start:Click4Step3
  const accountApi = new docusignClick.AccountsApi(dsApiClient);

  // Get a list of all elastic templates
  return await accountApi.getClickwraps(args.accountId);
};
  //ds-snippet-end

module.exports = { getClickwraps };
