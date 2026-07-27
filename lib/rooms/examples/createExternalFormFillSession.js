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
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  //ds-snippet-end:Rooms6Step2

  if (args.docuSignFormId) {
    //ds-snippet-start:Rooms6Step4
    let externalFormFillSessionApi =
        new docusignRooms.ExternalFormFillSessionsApi(dsApiClient);
      let externalForm = null;
    //ds-snippet-end:Rooms6Step4

    //ds-snippet-start:Rooms6Step3
    let requestBody = { formId: args.docuSignFormId, roomId: args.roomId, xFrameAllowedUrl: 'http://localhost:3000' };
    //ds-snippet-end:Rooms6Step3

    //ds-snippet-start:Rooms6Step4
    externalForm = await new Promise((resolve, reject) => {
      externalFormFillSessionApi.createExternalFormFillSession(
        args.accountId,
        { body: requestBody },
        (err, data, response) => {
        if (err) return reject(err);
        resolve({ data, response });
      });
    });

    let headers = externalForm.response.headers;
    let remaining = headers['x-ratelimit-remaining'];
    let reset = headers['x-ratelimit-reset'];

    if (remaining && reset) {
      const resetInstant = new Date(Number(reset) * 1000);
      console.log(`API calls remaining: ${remaining}`);
      console.log(`Next Reset: ${resetInstant.toISOString()}`);
    }

    return externalForm.data;
  //ds-snippet-end:Rooms6Step4
  } else {
    let roomsApi = new docusignRooms.RoomsApi(dsApiClient);
      let roomDocuments = null;

    roomDocuments = await new Promise((resolve, reject) => {
      roomsApi.getDocuments(
      args.accountId,
      args.roomId,
        (err, data, response) => {
        if (err) return reject(err);
        resolve({ data, response });
      });
    });

    let headers = roomDocuments.response.headers;
    let remaining = headers['x-ratelimit-remaining'];
    let reset = headers['x-ratelimit-reset'];

    if (remaining && reset) {
      const resetInstant = new Date(Number(reset) * 1000);
      console.log(`API calls remaining: ${remaining}`);
      console.log(`Next Reset: ${resetInstant.toISOString()}`);
    }

    return roomDocuments.data;
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

    userRooms = await new Promise((resolve, reject) => {
      roomsApi.getRooms(
      args.accountId,
      { count: 5 }, /* optional*/
        (err, data, response) => {
        if (err) return reject(err);
        resolve({ data, response });
      });
    });

    let headers = userRooms.response.headers;
    let remaining = headers['x-ratelimit-remaining'];
    let reset = headers['x-ratelimit-reset'];

    if (remaining && reset) {
      const resetInstant = new Date(Number(reset) * 1000);
      console.log(`API calls remaining: ${remaining}`);
      console.log(`Next Reset: ${resetInstant.toISOString()}`);
    }

  return userRooms.data;
};

module.exports = { createExternalFormFillSession, getRooms };
