/**
 * @file
 * Example 009: Assign form to form group
 * @author DocuSign
 */

const docusignRooms = require("docusign-rooms");

/**
 * Get form groups
 * @param {object} args
 */
const getFormGroups = async (args) => {
  // Create an API with headers
  let dsApiClient = new docusignRooms.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);

  // Step 4 start
  const formsGroupsApi = new docusignRooms.FormGroupsApi(dsApiClient);
  const response = await formsGroupsApi.getFormGroups(args.accountId);
  // Step 4 end

  return response;
};

/**
 * Get form libraries
 * @param {object} args
 */
const getForms = async (args) => {
  // Create an API with headers
  let dsApiClient = new docusignRooms.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);

  // Get first form library id
  // Step 3 start
  const formLibrariesApi = new docusignRooms.FormLibrariesApi(dsApiClient);
  const formLibraries = await formLibrariesApi.getFormLibraries(args.accountId);
  const firstFormLibraryId =
    formLibraries.formsLibrarySummaries[0].formsLibraryId;
  // Step 3 end

  // Get offices via OfficesApi
  const { forms } = await formLibrariesApi.getFormLibraryForms(
    args.accountId,
    firstFormLibraryId
  );

  return forms;
};

/**
 * Assign form to form group
 * @param {object} args
 */
const assignFormToFormGroup = async (args) => {
  // Step 2 start
  let dsApiClient = new docusignRooms.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  // Step 2 end

  // Step 6 start
  const formsGroupsApi = new docusignRooms.FormGroupsApi(dsApiClient);
  const formGroupToAssign =
    new docusignRooms.FormGroupFormToAssign.constructFromObject({
      formId: args.formId,
      isRequired: true,
    });

  // Assign form to a form group via FormGroups API
  const results = await formsGroupsApi.assignFormGroupForm(
    args.accountId,
    args.formGroupId,
    {
      body: formGroupToAssign,
    }
  );
  // Step 6 end

  console.log(
    `Form ${args.formId} has been assigned to Form Group ID ${args.formGroupId}`
  );
  return results;
};

/**
 * Form page for this application
 */
const getFormsAndFormGroups = async (args) => {
  let formGroups, forms;

  formGroups = await getFormGroups(args);
  forms = await getForms(args);

  return { formGroups, forms };
};

module.exports = { assignFormToFormGroup, getFormsAndFormGroups };
