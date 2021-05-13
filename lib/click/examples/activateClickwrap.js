/**
 * @file
 * Example 2: Activating a clickwrap
 * @author DocuSign
 */

const docusignClick = require("docusign-click")

const activateClickwrap = exports


/**
 * Work with activating the clickwrap
 * @param {Object} args Arguments for creating a clickwrap
 * @return {Object} The object with value of clickwrapId or error
 */
activateClickwrap.activate = async (args) => {
    // Step 2. Construct the request body
    // Create clickwrapRequest model
    const clickwrapRequest = docusignClick.ClickwrapRequest.constructFromObject({
        status: "active"
    });

    // Step 4. Call the Click API
    // Create Click API client
    const dsApiClient = new docusignClick.ApiClient();
    dsApiClient.setBasePath(args.basePath);
    dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
    const accountApi = new docusignClick.AccountsApi(dsApiClient);

    // Update and activate a clickwrap
    const result = await accountApi.updateClickwrapVersion(
        args.accountId, args.clickwrapId, 1, { clickwrapRequest });
    console.log(`Clickwrap was updated. ClickwrapId ${result.clickwrapId}`);
    return result;
}
