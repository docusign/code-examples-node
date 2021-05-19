/**
 * @file
 * Example 002: Create Room From Template
 * @author DocuSign
 */

const docusignRooms = require("docusign-rooms");

/**
 * This function does creation of the room with data
 * @param {object} args
 */
const createRoomFromTemplate = async (args) => {
  // Step 2 start
  let dsApiClient = new docusignRooms.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  // Step 2 end

  // Step 3 start
  let roomsApi = new docusignRooms.RoomsApi(dsApiClient),
    results = null;
  let rolesApi = new docusignRooms.RolesApi(dsApiClient),
    rolesResult = null;

  rolesResult = await rolesApi.getRoles(args.accountId);
  args.roleId = rolesResult.roles[0].roleId;
  // Step 3 end

  // Step 4-1 start
  let roomWithData = makeRoomsWithData(args);
  // Step 4-1 end

  // Step 5-2 start
  results = await roomsApi.createRoom(args.accountId, roomWithData, null);
  // Step 5-2 end

  console.log(`Room with data was created. RoomId ${results.roomId}`);
  return results;
};

// Step 4-2 start
function makeRoomsWithData(args) {
  return {
    body: {
      name: args.roomsArgs.roomName,
      roleId: args.roleId,
      templateId: args.roomsArgs.templateId,
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
// Step 4-2 end

/**
 * Form page for this application
 */
const getTemplates = async (args) => {
  let dsApiClient = new docusignRooms.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);

  let roomTemplatesApi = new docusignRooms.RoomTemplatesApi(dsApiClient),
    userRoomsTemplates = null;

  userRoomsTemplates = await roomTemplatesApi.getRoomTemplates(
    args.accountId,
    null,
    null
  );

  return userRoomsTemplates;
};

module.exports = { createRoomFromTemplate, getTemplates };
