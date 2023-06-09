const docusignAdmin = require('docusign-admin');
const dsConfig = require('../../../config/index.js').config;

/**
 * This function creates a new user with active status
 */
 const createCLMESignUser = async (args) => {
  //ds-snippet-start:Admin2Step2
  let dsApiClient = new docusignAdmin.ApiClient();
  dsApiClient.setBasePath(dsConfig.adminAPIUrl);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  //ds-snippet-end:Admin2Step2

  //ds-snippet-start:Admin2Step5
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
  //ds-snippet-end:Admin2Step5

  //ds-snippet-start:Admin2Step6
  const usersApi = new docusignAdmin.UsersApi(dsApiClient);
  return usersApi.addOrUpdateUser(body, args.organizationId, args.accountId);
  //ds-snippet-end:Admin2Step6
}


const getProductPermissionProfiles = async (args) => {
  // Create an API Client with headers
  let dsApiClient = new docusignAdmin.ApiClient();
  dsApiClient.setBasePath(dsConfig.adminAPIUrl);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);

  //ds-snippet-start:Admin2Step3
  const productPermissionProfilesApi = new docusignAdmin.ProductPermissionProfilesApi(dsApiClient);
  const productPermissionProfiles = await productPermissionProfilesApi.getProductPermissionProfiles(args.organizationId, args.accountId);
  //ds-snippet-end:Admin2Step3


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

  //ds-snippet-start:Admin2Step4
  const dsGroupsApi = new docusignAdmin.DSGroupsApi(dsApiClient);
  const dsGroups = await dsGroupsApi.getDSGroups(args.organizationId, args.accountId);
  //ds-snippet-end:Admin2Step4

  return dsGroups.ds_groups;
}

module.exports = { createCLMESignUser, getProductPermissionProfiles, getDSAdminGroups };
