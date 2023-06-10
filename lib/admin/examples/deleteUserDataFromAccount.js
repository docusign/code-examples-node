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
  //ds-snippet-start:Admin11Step2
  const apiClient = new docusignAdmin.ApiClient();
  apiClient.setBasePath(args.basePath);
  apiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  //ds-snippet-end:Admin11Step2

  //ds-snippet-start:Admin11Step3
  const accountsApi = new docusignAdmin.AccountsApi(apiClient);
  const membershipDataRedactionRequest = docusignAdmin.IndividualMembershipDataRedactionRequest.constructFromObject({
    user_id: args.userId,
  });
  //ds-snippet-end:Admin11Step3

  //ds-snippet-start:Admin11Step4
  return await accountsApi.redactIndividualMembershipData(membershipDataRedactionRequest, args.accountId);
  //ds-snippet-end:Admin11Step4

}

module.exports = { deleteUser };
