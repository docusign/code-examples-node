/**
 * @file
 * Example 006: Create External Form Fill Session
 * @author DocuSign
 */

const docusignRooms = require('docusign-rooms');

/**
 * This function does the work of creating the form fill session
 */
const createExternalFormFillSession = async (args) => {
  //ds-snippet-start:Rooms6Step2
  let dsApiClient = new docusignRooms.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  //ds-snippet-end:Rooms6Step2

  if (args.docuSignFormId) {
    //ds-snippet-start:Rooms6Step4
    let externalFormFillSessionApi =
        new docusignRooms.ExternalFormFillSessionsApi(dsApiClient),
      externalForm = null;
    //ds-snippet-end:Rooms6Step4

    //ds-snippet-start:Rooms6Step3
    let requestBody = { formId: args.docuSignFormId, roomId: args.roomId, xFrameAllowedUrl: "http://localhost:3000" };
    //ds-snippet-end:Rooms6Step3

    //ds-snippet-start:Rooms6Step4
    externalForm =
      await externalFormFillSessionApi.createExternalFormFillSession(
        args.accountId,
        { body: requestBody }
      );

    return externalForm;
  //ds-snippet-end:Rooms6Step4
  } else {
    let roomsApi = new docusignRooms.RoomsApi(dsApiClient);
      let roomDocuments = null;

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
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);

  let roomsApi = new docusignRooms.RoomsApi(dsApiClient);
    let userRooms = null;

  userRooms = await roomsApi.getRooms(
    args.accountId,
    { count: 5 } /* optional*/
  );

  return userRooms;
};

module.exports = { createExternalFormFillSession, getRooms };
