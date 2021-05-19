/**
 * @file
 * Example 003: Export Data From Room
 * @author DocuSign
 */

const docusignRooms = require("docusign-rooms");

/**
 * Get Room Field Data
 * @param {object} args
 */
const exportDataFromRoom = async (args) => {
  // Step 2 start
  let dsApiClient = new docusignRooms.ApiClient();

  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  // Step 2 end

  // Step 3 start
  let roomsApi = new docusignRooms.RoomsApi(dsApiClient),
    results = null;
  results = roomsApi.getRoomFieldData(args.accountId, args.roomsArgs.roomId);
  // Step 3 end

  console.log(`Rooms Data retrieved: ${JSON.stringify(results)}`);
  return results;
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
    { count: 5 } /*optional*/,
    null
  );

  return userRooms;
};

module.exports = { exportDataFromRoom, getRooms };
