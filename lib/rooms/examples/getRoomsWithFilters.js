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
  // Step 2 start
  let dsApiClient = new docusignRooms.ApiClient();

  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  // Step 2 end

  // Step 4 start
  let roomsApi = new docusignRooms.RoomsApi(dsApiClient),
    results = null;

  results = await roomsApi.getRooms(args.accountId, args.roomsArgs);
  // Step 4 end

  console.log(`Get Rooms with filters ${JSON.stringify(results)}`);

  return results;
};

module.exports = { getRoomsWithFilters };
