/**
 * @file
 * Get orgnization id
 * @author DocuSign
 */

const docusignAdmin = require('docusign-admin');
const dsConfig = require('../../config/index.js').config;

/**
 * This function retrieves an organization id for the user
 */
async function getOrganizationId(req) {
  if (!req.session.organizationId){
    let dsApiClient = new docusignAdmin.ApiClient();
    dsApiClient.setBasePath(`${dsConfig.adminAPIUrl}`);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + req.user.accessToken);

    const accountsApi = new docusignAdmin.AccountsApi(dsApiClient);
    const organizations = await accountsApi.getOrganizations((error, data, response) => {
      const headers = response?.headers;

      const remaining = headers?.['x-ratelimit-remaining'];
      const reset = headers?.['x-ratelimit-reset'];

      if (remaining && reset) {
        const resetInstant = new Date(Number(reset) * 1000);

        console.log(`API calls remaining: ${remaining}`);
        console.log(`Next Reset: ${resetInstant.toISOString()}`);
      }
  });

    // It's possible to belong to more than one organization, but we assume you are in a single organization.
    const orgId = organizations.data.organizations[0].id;
    req.session.organizationId = orgId;
  }
}

module.exports = { getOrganizationId };
