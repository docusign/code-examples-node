const docusignAdmin = require('docusign-admin');

/**
 * This function deletes user data from an account using email address
 * @param {Object} args - object with arguments
 * @param {string} args.basePath
 * @param {string} args.accessToken
 * @param {string} args.email
 * @param {string} args.organizationId
 */
const deleteUser = async(args) => {
  //ds-snippet-start:Admin10Step2
  const apiClient = new docusignAdmin.ApiClient();
  apiClient.setBasePath(args.basePath);
  apiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  //ds-snippet-end:Admin10Step2

  const usersApi = new docusignAdmin.UsersApi(apiClient);
  const profiles = await usersApi.getUserDSProfilesByEmail(args.organizationId, { email: args.email });
  const user = profiles.users[0];

  //ds-snippet-start:Admin10Step3
  const organizationsApi = new docusignAdmin.OrganizationsApi(apiClient);
  const userRedactionRequest =
    docusignAdmin.IndividualUserDataRedactionRequest.constructFromObject({
      user_id: user.id,
      memberships: [
        docusignAdmin.MembershipDataRedactionRequest.constructFromObject({
          account_id: user.memberships[0].account_id,
        }),
      ],
    });
  //ds-snippet-end:Admin10Step3


  //ds-snippet-start:Admin10Step4
  return await organizationsApi.redactIndividualUserData(userRedactionRequest, args.organizationId);
  //ds-snippet-end:Admin10Step4
}

module.exports = { deleteUser };
