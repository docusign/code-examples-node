const docusignAdmin = require('docusign-admin');

/**
 * This function gets a user profile by user ID
 */
const getUserProfileByUserId = async(args) => {
  // Data for this method
  // args.basePath
  // args.accessToken
  // args.userId

  //ds-snippet-start:Admin7Step2
  const apiClient = new docusignAdmin.ApiClient();
  apiClient.setBasePath(args.basePath);
  apiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  //ds-snippet-end:Admin7Step2

  //ds-snippet-start:Admin7Step3
  const usersApi = new docusignAdmin.UsersApi(apiClient);
  return usersApi.getUserDSProfile(args.organizationId, args.userId);
  //ds-snippet-end:Admin7Step3
}

module.exports = { getUserProfileByUserId };
