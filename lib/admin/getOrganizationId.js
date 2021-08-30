/**
 * @file
 * Get orgnization id
 * @author DocuSign
 */

 const docusignAdmin = require('docusign-admin')
 , dsConfig = require("../../config/index.js").config
;

/**
 * This function retrieves an organization id for the user
 */
async function getOrganizationId (req) {
  if(!req.session.organizationId){
    let dsApiClient = new docusignAdmin.ApiClient();
    dsApiClient.setBasePath(`${dsConfig.adminAPIUrl}`);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + req.user.accessToken);

    const accountsApi = new docusignAdmin.AccountsApi(dsApiClient);
    const organizations = await accountsApi.getOrganizations();

    // It's possible to belong to more than one organization, but we assume you are in a single organization.
    const orgId = organizations.organizations[0].id;
    req.session.organizationId = orgId;
  }
}

module.exports = { getOrganizationId };