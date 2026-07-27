const docusignAdmin = require('docusign-admin');

/**
 * Delete user product permission profiles using an email address
 */
 const deleteUserProductPermissionProfile = async (args) => {
  //ds-snippet-start:Admin9Step2
  const dsApiClient = new docusignAdmin.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  //ds-snippet-end:Admin9Step2

  //ds-snippet-start:Admin9Step4
  const userProductProfileDeleteRequest = {
    user_email: args.email,
    product_ids: [ args.productId ]
  };
  //ds-snippet-end:Admin9Step4

  //ds-snippet-start:Admin9Step5
  const productPermissionProfilesApi = new docusignAdmin.ProductPermissionProfilesApi(dsApiClient);
  return productPermissionProfilesApi.removeUserProductPermission(userProductProfileDeleteRequest, args.organizationId, args.accountId);
  //ds-snippet-end:Admin9Step5
};

const getProductPermissionProfilesByEmail = async (args) => {
  // Create an API Client with headers
  const dsApiClient = new docusignAdmin.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);

  //ds-snippet-start:Admin9Step3
  const productPermissionProfilesApi = new docusignAdmin.ProductPermissionProfilesApi(dsApiClient);
  const getUserProductPermission = {
    email: args.email
  };

  const permissionProfiles = await productPermissionProfilesApi.getUserProductPermissionProfilesByEmail(args.organizationId, args.accountId, getUserProductPermission, (error, data, response) => {
      const headers = response?.headers;

      const remaining = headers?.['x-ratelimit-remaining'];
      const reset = headers?.['x-ratelimit-reset'];

      if (remaining && reset) {
        const resetInstant = new Date(Number(reset) * 1000);

        console.log(`API calls remaining: ${remaining}`);
        console.log(`Next Reset: ${resetInstant.toISOString()}`);
      }
  });
  return permissionProfiles.data['product_permission_profiles'];
  //ds-snippet-end:Admin9Step3
};

module.exports = { deleteUserProductPermissionProfile, getProductPermissionProfilesByEmail };
