/**
 * @file
 * Get orgnization id
 * @author DocuSign
 */

 const docusignAdmin = require('docusign-admin')
 , dsConfig = require("../../config/index.js").config
;

async function getOrganizationId (req) {
  if(req.session.organizationId){
      return req.session.organizationId;
  }
  let dsApiClient = new docusignAdmin.ApiClient();
  dsApiClient.setBasePath(`${dsConfig.adminAPIUrl}`);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + req.user.accessToken);

  const accountsApi = new docusignAdmin.AccountsApi(dsApiClient);
  const organizations = await accountsApi.getOrganizations();
  const orgId = organizations.organizations[0].id;
  req.session.organizationId = orgId;
  return orgId;
}

async function getProductPermissionProfiles(accessToken, accountId, organizationId) {
    // Create an API with headers
    let dsApiClient = new docusignAdmin.ApiClient();
    dsApiClient.setBasePath(dsConfig.adminAPIUrl);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + accessToken);

    // Step 3 start
    const productPermissionProfilesApi = new docusignAdmin.ProductPermissionProfilesApi(dsApiClient);
    const productPermissionProfiles =  await productPermissionProfilesApi.getProductPermissionProfiles(organizationId, accountId);
    // Step 3 end

    return productPermissionProfiles.product_permission_profiles;
}

async function getDsAdminGroups(accessToken, accountId, organizationId) {
    // Create an API with headers
    let dsApiClient = new docusignAdmin.ApiClient();
    dsApiClient.setBasePath(`${dsConfig.adminAPIUrl}`);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + accessToken);

    // Step 4 start
    const dsGroupsApi = new docusignAdmin.DSGroupsApi(dsApiClient);
    const dsGroups = await dsGroupsApi.getDSGroups(organizationId, accountId);
    // Step 4 end

    return dsGroups.ds_groups;
}

async function checkUserExistsByEmail(req, userEmail) {
    // Create an API with headers
    const dsApiClient = new docusignAdmin.ApiClient();
    dsApiClient.setBasePath(`${dsConfig.adminAPIUrl}`);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + req.user.accessToken);

    usersApi = new docusignAdmin.UsersApi(dsApiClient);
    
    const options = {
        email: userEmail
    };
    const response = await usersApi.getUsers(req.session.organizationId, options);

    if(response.users.length > 0 && response.users[0].user_status !== 'closed') {
        return true;
    }

    return false;
}

exports.getOrganizationId = getOrganizationId;
exports.getProductPermissionProfiles = getProductPermissionProfiles;
exports.getDsAdminGroups = getDsAdminGroups;
exports.checkUserExistsByEmail = checkUserExistsByEmail;
