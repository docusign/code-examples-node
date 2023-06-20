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
  //ds-snippet-start:Click2Step3
  const clickwrapRequest = docusignClick.ClickwrapRequest.constructFromObject({
    status: "active",
  });
  //ds-snippet-end:Click2Step3

  // Step 4. Call the Click API
  // Create Click API client
  //ds-snippet-start:Click2Step2
  const dsApiClient = new docusignClick.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  //ds-snippet-end:Click1Step2
  const accountApi = new docusignClick.AccountsApi(dsApiClient);

  // Update and activate a clickwrap
  //ds-snippet-start:Click2Step4
  const result = await accountApi.updateClickwrapVersion(
    args.accountId,
    args.clickwrapId,
    args.clickwrapVersionNumber,
    { clickwrapRequest }
  );
  //ds-snippet-end:Click2Step4
  console.log(`Clickwrap was updated. ClickwrapId ${result.clickwrapId}`);
  return result;
};

// get inactive clickwraps
const getInactiveClickwraps = async (args) => {
  // Call the Click API
  // Create Click API client
  const dsApiClient = new docusignClick.ApiClient();
  dsApiClient.setBasePath(args.basePath)
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  const accountApi = new docusignClick.AccountsApi(dsApiClient);

  // Get a list of inactive clickwraps
  let clickwraps = [];
  for (const status of args.statuses) {
    const response = await accountApi.getClickwraps(args.accountId, { status });
    clickwraps = clickwraps.concat(response.clickwraps);
  }

  return { clickwraps };
}

module.exports = { activateClickwrap, getInactiveClickwraps };
