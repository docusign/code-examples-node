const docusignAdmin = require('docusign-admin');
const dsConfig = require('../../../config/index.js').config;

/**
 * This function creates a new user with active status
 */
 const createCLMESignUser = async (args) => {
  // Step 2 start
  let dsApiClient = new docusignAdmin.ApiClient();
  dsApiClient.setBasePath(dsConfig.adminAPIUrl);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  // Step 2 end

  // Step 5 start
  const body = {
    user_name: args.userName,
    first_name: args.firstName,
    last_name: args.lastName,
    email: args.email,
    auto_activate_memberships: true,
    product_permission_profiles: [
      {
        permission_profile_id: args.eSignPermissionProfileId,
        product_id: args.eSignProductId
      },
      {
        permission_profile_id: args.clmPermissionProfileId,
        product_id: args.clmProductId
      }
    ],
    ds_groups: [
      {
        ds_group_id: args.dsGroupId
      }
    ]
  }
  // Step 5 end

  // Step 6 start
  const usersApi = new docusignAdmin.UsersApi(dsApiClient);
  return usersApi.addOrUpdateUser(body, args.organizationId, args.accountId);
  // Step 6 end
}


const getProductPermissionProfiles = async (args) => {
  // Create an API Client with headers
  let dsApiClient = new docusignAdmin.ApiClient();
  dsApiClient.setBasePath(dsConfig.adminAPIUrl);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);

  // Step 3 start
  const productPermissionProfilesApi = new docusignAdmin.ProductPermissionProfilesApi(dsApiClient);
  const productPermissionProfiles = await productPermissionProfilesApi.getProductPermissionProfiles(args.organizationId, args.accountId);
  // Step 3 end


  productPermissionProfiles.product_permission_profiles.forEach(function (productPermissionProfile) {
    if (productPermissionProfile.product_name == "CLM") {
      clmPermissionProfiles = productPermissionProfile.permission_profiles;
      clmProductId = productPermissionProfile.product_id;
    } else {
      eSignPermissionProfiles = productPermissionProfile.permission_profiles;
      eSignProductId = productPermissionProfile.product_id;
    }
  })

  return { clmPermissionProfiles, clmProductId, eSignPermissionProfiles, eSignProductId };
}

const getDSAdminGroups = async (args) => {
  // Create an API Client with headers
  let dsApiClient = new docusignAdmin.ApiClient();
  dsApiClient.setBasePath(`${dsConfig.adminAPIUrl}`);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);

  // Step 4 start
  const dsGroupsApi = new docusignAdmin.DSGroupsApi(dsApiClient);
  const dsGroups = await dsGroupsApi.getDSGroups(args.organizationId, args.accountId);
  // Step 4 end

  return dsGroups.ds_groups;
}

module.exports = { createCLMESignUser, getProductPermissionProfiles, getDSAdminGroups };
