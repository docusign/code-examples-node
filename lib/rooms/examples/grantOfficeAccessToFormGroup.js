/**
 * @file
 * Example 008: Grant office access to form group
 * @author DocuSign
 */

const docusignRooms = require("docusign-rooms");

/**
 * Get form groups
 * @param {object} args
 */

/**
 * Get offices
 * @param {object} args
 */
const getOffices = async (args) => {

  // Create an API with headers
  //ds-snippet-start:Rooms8Step2
  let dsApiClient = new docusignRooms.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  //ds-snippet-end:Rooms8Step2

  // GET offices via OfficesApi
  //ds-snippet-start:Rooms8Step3
  const officesApi = new docusignRooms.OfficesApi(dsApiClient);
  const results = await officesApi.getOffices(args.accountId);
  //ds-snippet-end:Rooms8Step3

  return results.officeSummaries;
};

/**
 * Get form groups
 * @param {object} args
 */
const getFormGroups = async (args) => {
  // Create an API with headers
  let dsApiClient = new docusignRooms.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);

  // GET offices via OfficesApi
  //ds-snippet-start:Rooms8Step4
  const officesApi = new docusignRooms.FormGroupsApi(dsApiClient);
  const results = await officesApi.getFormGroups(args.accountId);
  //ds-snippet-end:Rooms8Step4

  return results.formGroups;
};

/**
 * Form page for this application
 */
const getFormGroupsAndOffices = async (args) => {
  let formGroups, offices;

  formGroups = await getFormGroups(args);
  offices = await getOffices(args);

  return { formGroups, offices };
};

const grantOfficeAccessToFormGroup = async (args) => {
  // Create an API with headers
  let dsApiClient = new docusignRooms.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);

  //ds-snippet-start:Rooms8Step5
  const formsGroupsApi = new docusignRooms.FormGroupsApi(dsApiClient);
  const results = await formsGroupsApi.grantOfficeAccessToFormGroup(args.accountId, args.formGroupId, args.officeId);
  //ds-snippet-end:Rooms8Step5

  return results;
};

module.exports = { grantOfficeAccessToFormGroup, getFormGroupsAndOffices };
