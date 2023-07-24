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
  //ds-snippet-start:Rooms7Step2
  let dsApiClient = new docusignRooms.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  //ds-snippet-end:Rooms7Step2

  //ds-snippet-start:Rooms7Step3
  const form = new docusignRooms.FormGroupForCreate.constructFromObject({
    name: args.formGroupName,
  });
  //ds-snippet-end:Rooms7Step2

  // Post the form object using SDK
  //ds-snippet-start:Rooms7Step4
  const formsGroupsApi = new docusignRooms.FormGroupsApi(dsApiClient);
  const results = await formsGroupsApi.createFormGroup(args.accountId, {
    body: form,
  });
  //ds-snippet-end:Rooms7Step4

  console.log(
    `Form Group ${args.formGroupName} has been created. Form Group ID ${results.formGroupId}`
  );
  return results;
};

module.exports = { createFormGroup };
