const docusignAdmin = require('docusign-admin');

/**
 * This function deletes user data from an account using user ID
 * @param {Object} args - object with arguments
 * @param {string} args.basePath
 * @param {string} args.accessToken
 * @param {string} args.accountId
 * @param {string} args.userId
 */
const deleteUser = async(args) => {
  // Step 2 start
  const apiClient = new docusignAdmin.ApiClient();
  apiClient.setBasePath(args.basePath);
  apiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  // Step 2 end

  // Step 3 start
  const accountsApi = new docusignAdmin.AccountsApi(apiClient);
  const membershipDataRedactionRequest = docusignAdmin.IndividualMembershipDataRedactionRequest.constructFromObject({
    user_id: args.userId,
  });
  // Step 3 end

  // Step 4 start
  return await accountsApi.redactIndividualMembershipData(membershipDataRedactionRequest, args.accountId);
  // Step 4 end
  
}

module.exports = { deleteUser };
