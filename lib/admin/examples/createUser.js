const docusignAdmin = require('docusign-admin');
const docusignESign = require('docusign-esign');

/**
 * This function creates a new user with active status
 */
const createUser = async (args) => {
  // Data for this method
  // args.requestUrl
  // args.accessToken
  // args.email
  // args.user_name
  // args.first_name
  // args.last_name
  // args.permission_profile_id
  // args.group_id

  //ds-snippet-start:Admin1Step2
  const apiClient = new docusignAdmin.ApiClient();
  apiClient.setBasePath(args.basePath);
  apiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  //ds-snippet-end:Admin1Step2

  //ds-snippet-start:Admin1Step5
  const userData = {
    user_name: args.user_name,
    first_name: args.first_name,
    last_name: args.last_name,
    email: args.email,
    auto_activate_memberships: true,
    accounts: [
      {
        id: args.accountId,
        permission_profile: {
          id: args.permission_profile_id
        },
        groups: [
          {
            id: args.group_id
          }
        ]
      }
    ]
  };
  //ds-snippet-end:Admin1Step5

  //ds-snippet-start:Admin1Step6
  const usersApi = new docusignAdmin.UsersApi(apiClient);
  return usersApi.createUser(userData, args.organizationId);
  //ds-snippet-end:Admin1Step6
};

const getPermissionProfilesAndGroups = async (args) => {
  const apiClient = new docusignESign.ApiClient();
  apiClient.setBasePath(args.basePath);
  apiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);

  //ds-snippet-start:Admin1Step3
  const accountsApi = new docusignESign.AccountsApi(apiClient);
  const profiles = await accountsApi.listPermissions(args.accountId, (error, data, response) => {
      const headers = response?.headers;

      const remaining = headers?.['x-ratelimit-remaining'];
      const reset = headers?.['x-ratelimit-reset'];

      if (remaining && reset) {
        const resetInstant = new Date(Number(reset) * 1000);

        console.log(`API calls remaining: ${remaining}`);
        console.log(`Next Reset: ${resetInstant.toISOString()}`);
      }
  });
  var profilesList = profiles.data;
  //ds-snippet-end:Admin1Step3

  //ds-snippet-start:Admin1Step4
  const groupsApi = new docusignESign.GroupsApi(apiClient);
  const groups = await groupsApi.listGroups(args.accountId, (error, data, response) => {
      const headers = response?.headers;

      const remaining = headers?.['x-ratelimit-remaining'];
      const reset = headers?.['x-ratelimit-reset'];

      if (remaining && reset) {
        const resetInstant = new Date(Number(reset) * 1000);

        console.log(`API calls remaining: ${remaining}`);
        console.log(`Next Reset: ${resetInstant.toISOString()}`);
      }
  });
  var groupsList = groups.data;
  //ds-snippet-end:Admin1Step4

  return { profilesList, groupsList };
};

module.exports = { createUser, getPermissionProfilesAndGroups };
