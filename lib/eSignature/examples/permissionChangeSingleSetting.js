/**
 * @file
 * Example 026: Updateing individual permission profile settings
 * @author DocuSign
 */

const docusign = require('docusign-esign')

const permissionChangeSingleSetting = exports


permissionChangeSingleSetting.updatePermissionProfile = async (args) => {
    // Step 1. Construct your API headers
    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(args.basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    let accountsApi = new docusign.AccountsApi(dsApiClient);

    // Step 2. Construct the request
    const requestBody = {
        permissionProfile: {
            permissionProfileName: args.profileName
        }
    };

    // Step 3. Call the eSignature REST API
    let results = await accountsApi.updatePermissionProfile(args.accountId, args.selectedId,
        requestBody)

  return results;
}
// ***DS.snippet.0.end

/**
 * Form page for this application
 */
permissionChangeSingleSetting.getProfiles = async (args) => {
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);

  let accountApi = new docusign.AccountsApi(dsApiClient)
  let profiles = await accountApi.listPermissions(args.accountId)

  return profiles;
}
