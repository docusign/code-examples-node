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
const grantOfficeAccessToFormGroup = async (args) => {
  // Create an API with headers
  let dsApiClient = new docusignRooms.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);

  // GET Form Groups via FormGroupsAPI
  // Step 4 start
  const formsGroupsApi = new docusignRooms.FormGroupsApi(dsApiClient);
  const results = await formsGroupsApi.getFormGroups(args.accountId);
  // Step 4 end

  return results.formGroups;
};

/**
 * Get offices
 * @param {object} args
 */
const getOffices = async (args) => {
  // Create an API with headers
  let dsApiClient = new docusignRooms.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);

  // GET offices via OfficesApi
  // Step 3 start
  const officesApi = new docusignRooms.OfficesApi(dsApiClient);
  const results = await officesApi.getOffices(args.accountId);
  // Step 3 end

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
  // Step 3 start
  const officesApi = new docusignRooms.FormGroupsApi(dsApiClient);
  const results = await officesApi.getFormGroups(args.accountId);
  // Step 3 end

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

module.exports = { grantOfficeAccessToFormGroup, getFormGroupsAndOffices };
