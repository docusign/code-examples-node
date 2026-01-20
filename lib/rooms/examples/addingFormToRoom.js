/**
 * @file
 * Example 004: Adding Form To Room
 * @author DocuSign
 */

const docusignRooms = require('docusign-rooms');

/**
 * This function does creation of the room with data
 * @param {object} args
 */
const addFormToRoom = async (args) => {
  //ds-snippet-start:Rooms4Step2
  let dsApiClient = new docusignRooms.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  //ds-snippet-end:Rooms4Step2

  //ds-snippet-start:Rooms4Step4
  let roomsApi = new docusignRooms.RoomsApi(dsApiClient);
    let results = null;

    results = await new Promise((resolve, reject) => {
      roomsApi.addFormToRoom(
        args.accountId,
        args.roomsArgs.roomId,
        { body: { formId: args.roomsArgs.libraryFormId } },
        null,
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
  //ds-snippet-end:Rooms4Step4

  console.log(`Room with data was created. RoomId ${results.roomId}`);
  return results;
};

/**
 * Form page for this application
 */
const getFormsAndRooms = async (args) => {
  let dsApiClient = new docusignRooms.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);

  //ds-snippet-start:Rooms4Step3
  let formLibrariesApi = new docusignRooms.FormLibrariesApi(dsApiClient);
  let formLibrariesResults = null;

  formLibrariesResults = await new Promise((resolve, reject) => {
      formLibrariesApi.getFormLibraries(
      args.accountId,
        (err, data, response) => {
        if (err) return reject(err);
        resolve({ data, response });
      });
    });

    headers = formLibrariesResults.response.headers;
    remaining = headers['x-ratelimit-remaining'];
    reset = headers['x-ratelimit-reset'];

    if (remaining && reset) {
      const resetInstant = new Date(Number(reset) * 1000);
      console.log(`API calls remaining: ${remaining}`);
      console.log(`Next Reset: ${resetInstant.toISOString()}`);
    }

  if (formLibrariesResults.data.formsLibrarySummaries.length === 0) {
    return;
  }

  const firstFormLibraryId = formLibrariesResults.data.formsLibrarySummaries.find(
    (lib) => lib.formCount > 0
  ).formsLibraryId;
    formsResults = await new Promise((resolve, reject) => {
      formLibrariesApi.getFormLibraryForms(
        args.accountId,
        firstFormLibraryId,
        (err, data, response) => {
        if (err) return reject(err);
        resolve({ data, response });
      });
    });

    headers = formsResults.response.headers;
    remaining = headers['x-ratelimit-remaining'];
    reset = headers['x-ratelimit-reset'];

    if (remaining && reset) {
      const resetInstant = new Date(Number(reset) * 1000);
      console.log(`API calls remaining: ${remaining}`);
      console.log(`Next Reset: ${resetInstant.toISOString()}`);
    }
  var formsResultsList = formsResults.data;
  //ds-snippet-end:Rooms4Step3

  let roomsApi = new docusignRooms.RoomsApi(dsApiClient);
  let userRooms = null;

  userRooms = await roomsApi.getRooms(
    args.accountId,
    { count: 5 } /* optional*/,
    null
  );

  return { formsResultsList, userRooms };
};

module.exports = { addFormToRoom, getFormsAndRooms };
