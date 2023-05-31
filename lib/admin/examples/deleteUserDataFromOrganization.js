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
  // Step 2 start
  const apiClient = new docusignAdmin.ApiClient();
  apiClient.setBasePath(args.basePath);
  apiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  // Step 2 end

  const usersApi = new docusignAdmin.UsersApi(apiClient);
  const profiles = await usersApi.getUserDSProfilesByEmail(args.organizationId, { email: args.email });
  const user = profiles.users[0];

  // Step 3 start
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
  // Step 3 end

  
  // Step 4 start
  return await organizationsApi.redactIndividualUserData(userRedactionRequest, args.organizationId);
  // Step 4 end
}

module.exports = { deleteUser };
