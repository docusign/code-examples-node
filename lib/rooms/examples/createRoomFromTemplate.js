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
  //ds-snippet-start:Rooms2Step2
  let dsApiClient = new docusignRooms.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  //ds-snippet-end:Rooms2Step2

  //ds-snippet-start:Rooms2Step3
  let roomsApi = new docusignRooms.RoomsApi(dsApiClient),
    results = null;
  let rolesApi = new docusignRooms.RolesApi(dsApiClient),
    rolesResult = null;

  rolesResult = await rolesApi.getRoles(args.accountId);
  args.roleId = rolesResult.roles[0].roleId;
  //ds-snippet-end:Rooms2Step3

  //ds-snippet-start:Rooms2Step4
  let roomWithData = makeRoomsWithData(args);
  //ds-snippet-end:Rooms2Step4

  //ds-snippet-start:Rooms2Step5
  results = await roomsApi.createRoom(args.accountId, roomWithData, null);
  //ds-snippet-end:Rooms2Step5

  console.log(`Room with data was created. RoomId ${results.roomId}`);
  return results;
};

//ds-snippet-start:Rooms2Step4
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
//ds-snippet-end:Rooms2Step4

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
