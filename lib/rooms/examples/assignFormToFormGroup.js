/**
 * @file
 * Example 009: Assign form to form group
 * @author DocuSign
 */

const docusignRooms = require('docusign-rooms');

/**
 * Get form groups
 * @param {object} args
 */
const getFormGroups = async (args) => {
  // Create an API with headers
  let dsApiClient = new docusignRooms.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);

  //ds-snippet-start:Rooms9Step4
  const formsGroupsApi = new docusignRooms.FormGroupsApi(dsApiClient);
    response = await new Promise((resolve, reject) => {
      formsGroupsApi.getFormGroups(args.accountId,
        (err, data, response) => {
        if (err) return reject(err);
        resolve({ data, response });
      });
    });

    let headers = response.response.headers;
    let remaining = headers['x-ratelimit-remaining'];
    let reset = headers['x-ratelimit-reset'];

    if (remaining && reset) {
      const resetInstant = new Date(Number(reset) * 1000);
      console.log(`API calls remaining: ${remaining}`);
      console.log(`Next Reset: ${resetInstant.toISOString()}`);
    }
  //ds-snippet-end

  return response.data;
};

/**
 * Get form libraries
 * @param {object} args
 */
const getForms = async (args) => {
  // Create an API with headers
  let dsApiClient = new docusignRooms.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);

  // Get first form library id
  //ds-snippet-start:Rooms9Step3
  const formLibrariesApi = new docusignRooms.FormLibrariesApi(dsApiClient);
  formLibraries = await new Promise((resolve, reject) => {
      formLibrariesApi.getFormLibraries(args.accountId,
        (err, data, response) => {
        if (err) return reject(err);
        resolve({ data, response });
      });
    });

    let headers = formLibraries.response.headers;
    let remaining = headers['x-ratelimit-remaining'];
    let reset = headers['x-ratelimit-reset'];

    if (remaining && reset) {
      const resetInstant = new Date(Number(reset) * 1000);
      console.log(`API calls remaining: ${remaining}`);
      console.log(`Next Reset: ${resetInstant.toISOString()}`);
    }

  const firstFormLibraryId = formLibraries.data.formsLibrarySummaries.find(lib => lib.formCount > 0).formsLibraryId;
  //ds-snippet-end

  // Get offices via OfficesApi
  formsData = await new Promise((resolve, reject) => {
      formLibrariesApi.getFormLibraryForms(
        args.accountId,
        firstFormLibraryId,
        (err, data, response) => {
        if (err) return reject(err);
        resolve({ data, response });
      });
    });

    headers = formsData.response.headers;
    remaining = headers['x-ratelimit-remaining'];
    reset = headers['x-ratelimit-reset'];

    if (remaining && reset) {
      const resetInstant = new Date(Number(reset) * 1000);
      console.log(`API calls remaining: ${remaining}`);
      console.log(`Next Reset: ${resetInstant.toISOString()}`);
    }
    forms = formsData.data;

  return forms;
};

/**
 * Assign form to form group
 * @param {object} args
 */
const assignFormToFormGroup = async (args) => {
  //ds-snippet-start:Rooms9Step2
  let dsApiClient = new docusignRooms.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  //ds-snippet-end

  //ds-snippet-start:Rooms9Step6
  const formsGroupsApi = new docusignRooms.FormGroupsApi(dsApiClient);
  //ds-snippet-end
  //ds-snippet-start:Rooms9Step5
  const formGroupToAssign =
    new docusignRooms.FormGroupFormToAssign.constructFromObject({
      formId: args.formId,
      isRequired: true,
    });
  //ds-snippet-end
  // Assign form to a form group via FormGroups API
  //ds-snippet-start:Rooms9Step6
  results = await new Promise((resolve, reject) => {
      formsGroupsApi.assignFormGroupForm(
        args.accountId,
        args.formGroupId,
        {
          body: formGroupToAssign,
        },
        (err, data, response) => {
        if (err) return reject(err);
        resolve({ data, response });
      });
    });

    headers = results.response.headers;
    remaining = headers['x-ratelimit-remaining'];
    reset = headers['x-ratelimit-reset'];

    if (remaining && reset) {
      const resetInstant = new Date(Number(reset) * 1000);
      console.log(`API calls remaining: ${remaining}`);
      console.log(`Next Reset: ${resetInstant.toISOString()}`);
    }
  //ds-snippet-end

  console.log(
    `Form ${args.formId} has been assigned to Form Group ID ${args.formGroupId}`
  );
  return results.data;
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
