/**
 * @file
 * Example 027: Deleting a permission profile
 * @author DocuSign
 */

const docusign = require('docusign-esign');

/**
 * This function does the work of deleting the permission
 */
const deletePermission = async (args) => {
  // Construct your API headers
  //ds-snippet-start:eSign27Step2
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  let accountsApi = new docusign.AccountsApi(dsApiClient);
  //ds-snippet-end:eSign27Step2

  //ds-snippet-start:eSign27Step3
  await accountsApi.deletePermissionProfile(args.accountId, args.profileId, (error, data, response) => {
      const headers = response?.headers;

      const remaining = headers?.['x-ratelimit-remaining'];
      const reset = headers?.['x-ratelimit-reset'];

      if (remaining && reset) {
        const resetInstant = new Date(Number(reset) * 1000);

        console.log(`API calls remaining: ${remaining}`);
        console.log(`Next Reset: ${resetInstant.toISOString()}`);
      }
  });
  //ds-snippet-end:eSign27Step3
};

/**
 * Form page for this application
 */
const getPermissions = async (args) => {
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);

  let accountApi = new docusign.AccountsApi(dsApiClient);
  let profiles = await accountApi.listPermissions(args.accountId, (error, data, response) => {
      const headers = response?.headers;

      const remaining = headers?.['x-ratelimit-remaining'];
      const reset = headers?.['x-ratelimit-reset'];

      if (remaining && reset) {
        const resetInstant = new Date(Number(reset) * 1000);

        console.log(`API calls remaining: ${remaining}`);
        console.log(`Next Reset: ${resetInstant.toISOString()}`);
      }
  });
  let permissionProfiles = profiles.data.permissionProfiles;

  return permissionProfiles;
};


module.exports = { deletePermission, getPermissions };
