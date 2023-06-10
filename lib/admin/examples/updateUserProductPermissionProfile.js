const docusignAdmin = require('docusign-admin');

/**
 * Update user product permission profiles using an email address
 */
 const updateUserProductPermissionProfile = async (args) => {
  //ds-snippet-start:Admin8Step2
  const dsApiClient = new docusignAdmin.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  //ds-snippet-end:Admin8Step2

  //ds-snippet-start:Admin8Step3
  const userProductPermissionProfilesRequest  = {
    email: args.email,
    product_permission_profiles: [
      {
        permission_profile_id: args.permissionProfileId,
        product_id: args.productId
      }
    ]
  }
  //ds-snippet-end:Admin8Step3

  //ds-snippet-start:Admin8Step4
  const productPermissionProfilesApi = new docusignAdmin.ProductPermissionProfilesApi(dsApiClient);
  return productPermissionProfilesApi.addUserProductPermissionProfilesByEmail(userProductPermissionProfilesRequest, args.organizationId, args.accountId);
  //ds-snippet-end:Admin8Step4
}

const getProductPermissionProfiles = async (args) => {
  // Create an API Client with headers
  const dsApiClient = new docusignAdmin.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);

  const productPermissionProfilesApi = new docusignAdmin.ProductPermissionProfilesApi(dsApiClient);
  const productPermissionProfiles = await productPermissionProfilesApi.getProductPermissionProfiles(args.organizationId, args.accountId);

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
}

module.exports = { updateUserProductPermissionProfile, getProductPermissionProfiles };
