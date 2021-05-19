/**
 * @file
 * Example 007: Create Form Group
 * @author DocuSign
 */

const docusignRooms = require("docusign-rooms");

/**
 * Create form group
 * @param {object} args
 */
const createFormGroup = async (args) => {
  // Step 2 start
  let dsApiClient = new docusignRooms.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  // Step 2 end

  // Step 3 start
  const form = new docusignRooms.FormGroupForCreate.constructFromObject({
    name: args.formGroupName,
  });
  // Step 3 end

  // Step 4 start
  // Post the form object using SDK
  const formsGroupsApi = new docusignRooms.FormGroupsApi(dsApiClient);
  const results = await formsGroupsApi.createFormGroup(args.accountId, {
    body: form,
  });
  // Step 4 end

  console.log(
    `Form Group ${args.formGroupName} has been created. Form Group ID ${results.formGroupId}`
  );
  return results;
};

module.exports = { createFormGroup };
