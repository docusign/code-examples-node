/**
 * @file
 * Example 004: Adding Form To Room
 * @author DocuSign
 */

const docusignRooms = require("docusign-rooms");

/**
 * This function does creation of the room with data
 * @param {object} args
 */
const addFormToRoom = async (args) => {
  //ds-snippet-start:Rooms4Step2
  let dsApiClient = new docusignRooms.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  //ds-snippet-end:Rooms4Step2

  //ds-snippet-start:Rooms4Step4
  let roomsApi = new docusignRooms.RoomsApi(dsApiClient),
    results = null;

  results = roomsApi.addFormToRoom(
    args.accountId,
    args.roomsArgs.roomId,
    { body: { formId: args.roomsArgs.libraryFormId } },
    null
  );
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
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);

  //ds-snippet-start:Rooms4Step3
  let formLibrariesApi = new docusignRooms.FormLibrariesApi(dsApiClient),
    formLibrariesResults = null;

  formLibrariesResults = await formLibrariesApi.getFormLibraries(
    args.accountId
  );

  if (formLibrariesResults.formsLibrarySummaries.length === 0) {
    return;
  }

  const formsResults = await formLibrariesApi.getFormLibraryForms(
    args.accountId,
    formLibrariesResults.formsLibrarySummaries[0].formsLibraryId
  );
  //ds-snippet-end:Rooms4Step3

  let roomsApi = new docusignRooms.RoomsApi(dsApiClient),
    userRooms = null;

  userRooms = await roomsApi.getRooms(
    args.accountId,
    { count: 5 } /*optional*/,
    null
  );

  return { formsResults, userRooms };
};

module.exports = { addFormToRoom, getFormsAndRooms };
