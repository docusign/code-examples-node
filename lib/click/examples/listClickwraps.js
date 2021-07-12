/**
 * @file
 * Example 4: Get list of clickwraps
 * @author DocuSign
 */

const docusignClick = require("docusign-click");

/**
 * Get list of clickwraps
 * @param {Object} args Arguments for creating clickwrap
 * @return {Object} The object with value of clickwrapId or error
 */
const getClickwraps = async (args) => {
  // Call the Click API
  // Create Click API client
  const dsApiClient = new docusignClick.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  const accountApi = new docusignClick.AccountsApi(dsApiClient);

  // Get a list of all clickwraps
  return await accountApi.getClickwraps(args.accountId);
};

module.exports = { getClickwraps };
