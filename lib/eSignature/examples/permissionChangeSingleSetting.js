/**
 * @file
 * Example 026: Updateing individual permission profile settings
 * @author DocuSign
 */

const docusign = require("docusign-esign");

/**
 * This function does the work of updating the permission profile
 */
const updatePermissionProfile = async (args) => {
  // Step 1. Construct your API headers
  //ds-snippet-start:eSign26Step2
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  let accountsApi = new docusign.AccountsApi(dsApiClient);
  //ds-snippet-end:eSign26Step2

  // Step 2. Construct the request
  //ds-snippet-start:eSign26Step3
  const requestBody = {
    permissionProfile: {
      permissionProfileName: args.profileName,
    },
  };
  //ds-snippet-end:eSign26Step3

  // Step 3. Call the eSignature REST API
  //ds-snippet-start:eSign26Step4
  let results = await accountsApi.updatePermissionProfile(
    args.accountId,
    args.selectedId,
    requestBody
  );
  //ds-snippet-end:eSign26Step4

  return results;
};

/**
 * Form page for this application
 */
const getProfiles = async (args) => {
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);

  let accountApi = new docusign.AccountsApi(dsApiClient);
  let profiles = await accountApi.listPermissions(args.accountId);

  return profiles;
};

module.exports = { updatePermissionProfile, getProfiles };
