const docusignAdmin = require('docusign-admin');

/**
 * This function gets a user profile by email
 */
const getUserProfileByEmail = async(args) => {
  // Data for this method
  // args.basePath
  // args.accessToken
  // args.email

  // Step 2 start
  const apiClient = new docusignAdmin.ApiClient();
  apiClient.setBasePath(args.basePath);
  apiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  // Step 2 end

  // Step 3 start
  const usersApi = new docusignAdmin.UsersApi(apiClient);
  return usersApi.getUserDSProfilesByEmail(args.organizationId, { email: args.email });
  // Step 3 end
}

module.exports = { getUserProfileByEmail };
