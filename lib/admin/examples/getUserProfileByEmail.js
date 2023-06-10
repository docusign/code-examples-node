const docusignAdmin = require('docusign-admin');

/**
 * This function gets a user profile by email
 */
const getUserProfileByEmail = async(args) => {
  // Data for this method
  // args.basePath
  // args.accessToken
  // args.email

  //ds-snippet-start:Admin6Step2
  const apiClient = new docusignAdmin.ApiClient();
  apiClient.setBasePath(args.basePath);
  apiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  //ds-snippet-end:Admin6Step2

  //ds-snippet-start:Admin6Step3
  const usersApi = new docusignAdmin.UsersApi(apiClient);
  return usersApi.getUserDSProfilesByEmail(args.organizationId, { email: args.email });
  //ds-snippet-end:Admin6Step3
}

module.exports = { getUserProfileByEmail };
