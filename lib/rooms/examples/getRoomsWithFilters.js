/**
 * @file
 * Example 005: Get Rooms With Filters
 * @author DocuSign
 */

const docusignRooms = require('docusign-rooms');

/**
 * Get filtered rooms
 * @param {object} args
 */
const getRoomsWithFilters = async (args) => {
  //ds-snippet-start:Rooms5Step2
  let dsApiClient = new docusignRooms.ApiClient();

  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  //ds-snippet-end:Rooms5Step2

  //ds-snippet-start:Rooms5Step4
  let roomsApi = new docusignRooms.RoomsApi(dsApiClient);
    let results = null;

    results = await new Promise((resolve, reject) => {
      roomsApi.getRooms(args.accountId, args.roomsArgs,
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
  //ds-snippet-end:Rooms5Step4

  console.log(`Get Rooms with filters ${JSON.stringify(results.data)}`);

  return results.data;
};

module.exports = { getRoomsWithFilters };
