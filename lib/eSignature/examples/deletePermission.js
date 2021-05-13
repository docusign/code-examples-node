/**
 * @file
 * Example 027: Deleting a permission profile
 * @author DocuSign
 */

const docusign = require('docusign-esign')

const deletePermission = exports

/**
 * Create the envelope
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
deletePermission.deletePermission = async (args) => {
    // Construct your API headers
    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(args.basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    let accountsApi = new docusign.AccountsApi(dsApiClient);

    await accountsApi.deletePermissionProfile(args.accountId, args.profileId)
}

// ***DS.snippet.0.end

/**
* Form page for this application
*/
deletePermission.getPermissions = async (args) => {
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);

  let accountApi = new docusign.AccountsApi(dsApiClient)
  let profiles = await accountApi.listPermissions(args.accountId)
  let permissionProfiles = profiles.permissionProfiles

  return permissionProfiles;
}
