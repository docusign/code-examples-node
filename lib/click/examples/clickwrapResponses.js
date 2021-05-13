/**
 * @file
 * Example 5: Get clickwrap responses
 * @author DocuSign
 */

const docusignClick = require("docusign-click");

const clickwrapResponses = exports;

/**
 * Get clickwrap responses using SDK
 * @param {Object} args Arguments for creating clickwrap
 * @return {Object} The object with value of clickwrapId or error
 */
clickwrapResponses.getClickwrapAgreements = async (args) => {
  // Call the Click API
  // Create click API client
  const dsApiClient = new docusignClick.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  const accountApi = new docusignClick.AccountsApi(dsApiClient);

  // Get clickwrap responses using SDK
  return await accountApi.getClickwrapAgreements(
    args.accountId,
    args.clickwrapId,
    args.clientUserId,
    "agreed"
  );
};
