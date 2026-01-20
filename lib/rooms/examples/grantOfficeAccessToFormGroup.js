/**
 * @file
 * Example 008: Grant office access to form group
 * @author DocuSign
 */

const docusignRooms = require('docusign-rooms');

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
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  //ds-snippet-end:Rooms8Step2

  // GET offices via OfficesApi
  //ds-snippet-start:Rooms8Step3
  const officesApi = new docusignRooms.OfficesApi(dsApiClient);
  const results = await new Promise((resolve, reject) => {
      officesApi.getOffices(args.accountId,
        (err, data, response) => {
        if (err) return reject(err);
        resolve({ data, response });
      });
    });

    let headers = results.response.headers;
    let remaining = headers['x-ratelimit-remaining'];
    let reset = headers['x-ratelimit-reset'];

    if (remaining && reset) {
      const resetInstant = new Date(Number(reset) * 1000);
      console.log(`API calls remaining: ${remaining}`);
      console.log(`Next Reset: ${resetInstant.toISOString()}`);
    }
  //ds-snippet-end:Rooms8Step3

  return results.data.officeSummaries;
};

/**
 * Get form groups
 * @param {object} args
 */
const getFormGroups = async (args) => {
  // Create an API with headers
  let dsApiClient = new docusignRooms.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);

  // GET offices via OfficesApi
  //ds-snippet-start:Rooms8Step4
  const officesApi = new docusignRooms.FormGroupsApi(dsApiClient);
    const results = await new Promise((resolve, reject) => {
      officesApi.getFormGroups(args.accountId,
        (err, data, response) => {
        if (err) return reject(err);
        resolve({ data, response });
      });
    });

    let headers = results.response.headers;
    let remaining = headers['x-ratelimit-remaining'];
    let reset = headers['x-ratelimit-reset'];

    if (remaining && reset) {
      const resetInstant = new Date(Number(reset) * 1000);
      console.log(`API calls remaining: ${remaining}`);
      console.log(`Next Reset: ${resetInstant.toISOString()}`);
    }
  //ds-snippet-end:Rooms8Step4

  return results.data.formGroups;
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
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);

  //ds-snippet-start:Rooms8Step5
  const formsGroupsApi = new docusignRooms.FormGroupsApi(dsApiClient);
      const results = await new Promise((resolve, reject) => {
        formsGroupsApi.grantOfficeAccessToFormGroup(args.accountId, args.formGroupId, args.officeId,
        (err, data, response) => {
        if (err) return reject(err);
        resolve({ data, response });
      });
    });

    let headers = results.response.headers;
    let remaining = headers['x-ratelimit-remaining'];
    let reset = headers['x-ratelimit-reset'];

    if (remaining && reset) {
      const resetInstant = new Date(Number(reset) * 1000);
      console.log(`API calls remaining: ${remaining}`);
      console.log(`Next Reset: ${resetInstant.toISOString()}`);
    }
  //ds-snippet-end:Rooms8Step5

  return results.data;
};

module.exports = { grantOfficeAccessToFormGroup, getFormGroupsAndOffices };
