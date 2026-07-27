/**
 * @file
 * Example 003: Export Data From Room
 * @author DocuSign
 */

const docusignRooms = require('docusign-rooms');

/**
 * Get Room Field Data
 * @param {object} args
 */
const exportDataFromRoom = async (args) => {
  //ds-snippet-start:Rooms3Step2
  let dsApiClient = new docusignRooms.ApiClient();

  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  //ds-snippet-end:Rooms3Step2

  //ds-snippet-start:Rooms3Step3
  let roomsApi = new docusignRooms.RoomsApi(dsApiClient);
    let results = null;
    results = await new Promise((resolve, reject) => {
      roomsApi.getRoomFieldData(args.accountId, args.roomsArgs.roomId, (err, data, response) => {
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
  //ds-snippet-end:Rooms3Step3

  console.log(`Rooms Data retrieved: ${JSON.stringify(results.data)}`);
  return results.data;
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
    { count: 5 } /* optional*/,
    null
  );

  return userRooms;
};

module.exports = { exportDataFromRoom, getRooms };
