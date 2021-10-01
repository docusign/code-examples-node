const docusignAdmin = require('docusign-admin');
const docusignESign = require('docusign-esign');

/**
 * This function creates a new user with active status
 */
const createUser = async(args) => {
  // Data for this method
  // args.requestUrl
  // args.accessToken
  // args.email
  // args.user_name
  // args.first_name
  // args.last_name
  // args.permission_profile_id
  // args.group_id

  // Step 2 start
  const apiClient = new docusignAdmin.ApiClient();
  apiClient.setBasePath(args.basePath);
  apiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  // Step 2 end

  // Step 5 start
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
  // Step 5 end

  // Step 6 start
  const usersApi = new docusignAdmin.UsersApi(apiClient);
  return usersApi.createUser(userData, args.organizationId);
  // Step 6 end
}

const getPermissionProfilesAndGroups = async(args) => {
  const apiClient = new docusignESign.ApiClient();
  apiClient.setBasePath(args.basePath);
  apiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);

  // Step 3 start  
  const accountsApi = new docusignESign.AccountsApi(apiClient);
  const profiles = await accountsApi.listPermissions(args.accountId);
  // Step 3 end

  // Step 4 start  
  const groupsApi = new docusignESign.GroupsApi(apiClient);
  const groups = await groupsApi.listGroups(args.accountId);
  // Step 4 end
  
  return { profiles, groups };
}

module.exports = { createUser, getPermissionProfilesAndGroups };
