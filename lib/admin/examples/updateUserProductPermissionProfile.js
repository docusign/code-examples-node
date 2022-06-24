const docusignAdmin = require('docusign-admin');

/**
 * Update user product permission profiles using an email address
 */
 const updateUserProductPermissionProfile = async (args) => {
  // Step 1 start
  const dsApiClient = new docusignAdmin.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  // Step 1 end

  // Step 2 start
  const userProductPermissionProfilesRequest  = {
    email: args.email,
    product_permission_profiles: [
      {
        permission_profile_id: args.permissionProfileId,
        product_id: args.productId
      }
    ]
  }
  // Step 2 end

  // Step 3 start
  const productPermissionProfilesApi = new docusignAdmin.ProductPermissionProfilesApi(dsApiClient);
  return productPermissionProfilesApi.addUserProductPermissionProfilesByEmail(userProductPermissionProfilesRequest, args.organizationId, args.accountId);
  // Step 3 end
}

const getProductPermissionProfiles = async (args) => {
  // Step 1 start
  // Create an API Client with headers
  const dsApiClient = new docusignAdmin.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  // Step 1 end

  // Step 2 start
  const productPermissionProfilesApi = new docusignAdmin.ProductPermissionProfilesApi(dsApiClient);
  const productPermissionProfiles = await productPermissionProfilesApi.getProductPermissionProfiles(args.organizationId, args.accountId);
  // Step 2 end

  // Step 3 start
  let clmPermissionProfiles;
  let eSignPermissionProfiles;
  let clmProductId;
  let eSignProductId;

  productPermissionProfiles.product_permission_profiles.forEach((productPermissionProfile) => {
    if (productPermissionProfile.product_name == "CLM") {
      clmPermissionProfiles = productPermissionProfile.permission_profiles;
      clmProductId = productPermissionProfile.product_id;
    } else {
      eSignPermissionProfiles = productPermissionProfile.permission_profiles;
      eSignProductId = productPermissionProfile.product_id;
    }
  })

  const products = [
    {
      product_id: clmProductId,
      product_name: "CLM"
    },
    {
      product_id: eSignProductId,
      product_name: "eSignature"
    }
  ]
  
  return { clmPermissionProfiles, products, eSignPermissionProfiles, eSignProductId, clmProductId };
  // Step 3 end
}

module.exports = { updateUserProductPermissionProfile, getProductPermissionProfiles };
