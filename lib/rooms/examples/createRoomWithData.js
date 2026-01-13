/**
 * @file
 * Example 001: Create Room With Data
 * @author DocuSign
 */

const docusignRooms = require('docusign-rooms');

/**
 * This function does creation of the room with data
 * @param {object} args
 */
const createRoomWithData = async (args) => {
  //ds-snippet-start:Rooms1Step2
  let dsApiClient = new docusignRooms.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  //ds-snippet-end:Rooms1Step2

  let roomsApi = new docusignRooms.RoomsApi(dsApiClient);
    let results = null;
  let rolesApi = new docusignRooms.RolesApi(dsApiClient);
    let rolesResult = null;

    rolesResult = await new Promise((resolve, reject) => {
      rolesApi.getRoles(args.accountId, (err, data, response) => {
        if (err) return reject(err);
        resolve({ data, response });
      });
    });

    let headers = rolesResult.response.headers;
    let remaining = headers['x-ratelimit-remaining'];
    let reset = headers['x-ratelimit-reset'];

    if (remaining && reset) {
      const resetInstant = new Date(Number(reset) * 1000);
      console.log(`API calls remaining: ${remaining}`);
      console.log(`Next Reset: ${resetInstant.toISOString()}`);
    }

  let defaultRoleId = null;
  for (let i = 0;i < rolesResult.data.roles.length;i++){
    if (rolesResult.data.roles[i].isDefaultForAdmin === true){
      defaultRoleId = rolesResult.data.roles[i].roleId;
    }
  }
  args.roomsWithDataArgs.roleId = defaultRoleId;

  //ds-snippet-start:Rooms1Step3
  let roomWithData = makeRoomsWithData(args.roomsWithDataArgs);
  //ds-snippet-end:Rooms1Step3

  //ds-snippet-start:Rooms1Step4
  results = await new Promise((resolve, reject) => {
      roomsApi.createRoom(args.accountId, roomWithData, null, (err, data, response) => {
        if (err) return reject(err);
        resolve({ data, response });
      });
    });

    headers = results.response.headers;
    remaining = headers['x-ratelimit-remaining'];
    reset = headers['x-ratelimit-reset'];

    if (remaining && reset) {
      const resetInstant = new Date(Number(reset) * 1000);
      console.log(`API calls remaining: ${remaining}`);
      console.log(`Next Reset: ${resetInstant.toISOString()}`);
    }
  //ds-snippet-end:Rooms1Step4

  console.log(`Room with data was created. RoomId ${results.data.roomId}`);
  return results.data;
};

//ds-snippet-start:Rooms1Step3
function makeRoomsWithData(args) {
  return {
    body: {
      name: args.roomName,
      roleId: args.roleId,
      transactionSideId: 'listbuy',
      fieldData: {
        data: {
          address1: '123 EZ Street',
          address2: 'unit 10',
          city: 'Galaxian',
          state: 'US-HI',
          postalCode: '11112',
          companyRoomStatus: '5',
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
//ds-snippet-end:Rooms1Step3

module.exports = { createRoomWithData };
