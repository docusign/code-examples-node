/**
 * @file
 * Example 005: Get Rooms With Filters
 * @author DocuSign
 */

const docusignRooms = require("docusign-rooms");

/**
 * Get filtered rooms
 * @param {object} args
 */
const getRoomsWithFilters = async (args) => {
  //ds-snippet-start:Rooms5Step2
  let dsApiClient = new docusignRooms.ApiClient();

  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  //ds-snippet-end:Rooms5Step2

  //ds-snippet-start:Rooms5Step4
  let roomsApi = new docusignRooms.RoomsApi(dsApiClient),
    results = null;

  results = await roomsApi.getRooms(args.accountId, args.roomsArgs);
  //ds-snippet-end:Rooms5Step4

  console.log(`Get Rooms with filters ${JSON.stringify(results)}`);

  return results;
};

module.exports = { getRoomsWithFilters };
