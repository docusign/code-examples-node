/**
 * @file
 * Example 006: Create External Form Fill Session
 * @author DocuSign
 */

const docusignRooms = require("docusign-rooms");

/**
 * This function does the work of creating the form fill session
 */
const createExternalFormFillSession = async (args) => {
  // Step 2 start
  let dsApiClient = new docusignRooms.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  // Step 2 end

  if (args.docuSignFormId) {
    // Step 4 start
    let externalFormFillSessionApi =
        new docusignRooms.ExternalFormFillSessionsApi(dsApiClient),
      externalForm = null;

    externalForm =
      await externalFormFillSessionApi.createExternalFormFillSession(
        args.accountId,
        { body: { formId: args.docuSignFormId, roomId: args.roomId } }
      );

    return externalForm;
    // Step 4 end
  } else {
    let roomsApi = new docusignRooms.RoomsApi(dsApiClient),
      roomDocuments = null;

    roomDocuments = await roomsApi.getDocuments(
      args.accountId,
      args.roomId
    );
    return roomDocuments;
  }
};

/**
 * Form page for this application
 */
const getRooms = async (args) => {
  let dsApiClient = new docusignRooms.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);

  let roomsApi = new docusignRooms.RoomsApi(dsApiClient),
    userRooms = null;

  userRooms = await roomsApi.getRooms(
    args.accountId,
    { count: 5 } /*optional*/
  );

  return userRooms;
};

module.exports = { createExternalFormFillSession, getRooms };
