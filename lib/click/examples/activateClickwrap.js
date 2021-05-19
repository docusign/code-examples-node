/**
 * @file
 * Example 2: Activating a clickwrap
 * @author DocuSign
 */

const docusignClick = require("docusign-click");

/**
 * Work with activating the clickwrap
 * @param {Object} args Arguments for creating a clickwrap
 * @return {Object} The object with value of clickwrapId or error
 */
const activateClickwrap = async (args) => {
  // Step 2. Construct the request body
  // Create clickwrapRequest model
  const clickwrapRequest = docusignClick.ClickwrapRequest.constructFromObject({
    status: "active",
  });
  const clickwrapVersionId = 1;

  // Step 4. Call the Click API
  // Create Click API client
  const dsApiClient = new docusignClick.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  const accountApi = new docusignClick.AccountsApi(dsApiClient);

  // Update and activate a clickwrap
  const result = await accountApi.updateClickwrapVersion(
    args.accountId,
    args.clickwrapId,
    clickwrapVersionId,
    { clickwrapRequest }
  );
  console.log(`Clickwrap was updated. ClickwrapId ${result.clickwrapId}`);
  return result;
};

module.exports = { activateClickwrap };
