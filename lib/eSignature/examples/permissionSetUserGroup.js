/**
 * @file
 * Example 025: The permission was set
 * @author DocuSign
 */

const docusign = require("docusign-esign");

/**
 * This function does the work of updating groups permissions
 */
const setPermission = async (args) => {
  // Step 1. Construct your API headers
  //ds-snippet-start:eSign25Step2
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  let groupApi = new docusign.GroupsApi(dsApiClient);
  //ds-snippet-end:eSign25Step2

  // Step 2: Construct the reqeust body
  //ds-snippet-start:eSign25Step3
  const requestBody = {
    groupInformation: {
      groups: [
        {
          permissionProfileId: args.permissionProfileId,
          groupId: args.userGroupId,
        },
      ],
    },
  };
  //ds-snippet-end:eSign25Step3

  //ds-snippet-start:eSign25Step4
  let results = await groupApi.updateGroups(args.accountId, requestBody);
  //ds-snippet-end:eSign25Step4

  return results;
};

/**
 * This function does the work of listing the user's permissions and groups
 */
const getGroupsAndPermissions = async (args) => {
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);

  let accountApi = new docusign.AccountsApi(dsApiClient);
  let listPermissions = await accountApi.listPermissions(args.accountId);

  let groupApi = new docusign.GroupsApi(dsApiClient);
  let userGroups = await groupApi.listGroups(args.accountId);

  return { listPermissions: listPermissions, userGroups: userGroups };
};

module.exports = { setPermission, getGroupsAndPermissions };
