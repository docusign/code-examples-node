/**
 * @file
 * Example 001: Create Room With Data
 * @author DocuSign
 */

const docusignRooms = require("docusign-rooms");

/**
 * This function does creation of the room with data
 * @param {object} args
 */
const createRoomWithData = async (args) => {
  // Step 2 start
  let dsApiClient = new docusignRooms.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  // Step 2 end

  let roomsApi = new docusignRooms.RoomsApi(dsApiClient),
    results = null;
  let rolesApi = new docusignRooms.RolesApi(dsApiClient),
    rolesResult = null;

  rolesResult = await rolesApi.getRoles(args.accountId);
  args.roomsWithDataArgs.roleId = rolesResult.roles[0].roleId;

  // Step 3-1 start
  let roomWithData = makeRoomsWithData(args.roomsWithDataArgs);
  // Step 3-1 end

  // Step 4 start
  results = await roomsApi.createRoom(args.accountId, roomWithData, null);
  // Step 4 end

  console.log(`Room with data was created. RoomId ${results.roomId}`);
  return results;
};

// Step 3-2 start
function makeRoomsWithData(args) {
  return {
    body: {
      name: args.roomName,
      roleId: args.roleId,
      transactionSideId: "listbuy",
      fieldData: {
        data: {
          address1: "123 EZ Street",
          address2: "unit 10",
          city: "Galaxian",
          state: "US-HI",
          postalCode: "11112",
          companyRoomStatus: "5",
          comments: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
                    sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
                    nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in 
                    reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla 
                    pariatur. Excepteur sint occaecat cupidatat non proident, sunt in 
                    culpa qui officia deserunt mollit anim id est laborum.`,
        },
      },
    },
  };
}

module.exports = { createRoomWithData };
