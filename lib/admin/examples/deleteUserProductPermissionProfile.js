const docusignAdmin = require('docusign-admin');

/**
 * Delete user product permission profiles using an email address
 */
 const deleteUserProductPermissionProfile = async (args) => {
  // Step 1 start
  const dsApiClient = new docusignAdmin.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  // Step 1 end

  // Step 2 start
  const userProductProfileDeleteRequest = {
    user_email: args.email,
    product_ids: [ args.productId ]
  }
  // Step 2 end

  // Step 3 start
  const productPermissionProfilesApi = new docusignAdmin.ProductPermissionProfilesApi(dsApiClient);
  return productPermissionProfilesApi.removeUserProductPermission(userProductProfileDeleteRequest, args.organizationId, args.accountId);
  // Step 3 end
}

const getProductPermissionProfilesByEmail = async (args) => {
  // Step 1 start
  // Create an API Client with headers
  const dsApiClient = new docusignAdmin.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  // Step 1 end

  // Step 2 start
  const productPermissionProfilesApi = new docusignAdmin.ProductPermissionProfilesApi(dsApiClient);
  const getUserProductPermission = {
    email: args.email
  }

  const permissionProfiles = await productPermissionProfilesApi.getUserProductPermissionProfilesByEmail(args.organizationId, args.accountId, getUserProductPermission);
  return permissionProfiles['product_permission_profiles'];
  // Step 2 end
}

module.exports = { deleteUserProductPermissionProfile, getProductPermissionProfilesByEmail };
