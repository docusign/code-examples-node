/**
 * @file
 * Example 006: Create External Form Fill Session
 * @author DocuSign
 */

const docusignRooms = require('docusign-rooms')

const createExternalFormFillSession = exports

createExternalFormFillSession.createSession = async (args) => {
    // Step 2 start
    let dsApiClient = new docusignRooms.ApiClient();
    dsApiClient.setBasePath(args.basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    // Step 2 end

    if(args.docuSignFormId) {
        // Step 4 start
        let externalFormFillSessionApi = new docusignRooms.ExternalFormFillSessionsApi(dsApiClient)
        , externalForm = null;

        externalForm = await externalFormFillSessionApi.createExternalFormFillSession(req.session.accountId, {body:{ formId: docuSignFormId, roomId: args.roomId }},
             null);

        return externalForm;
        // Step 4 end

    } else {
        let roomsApi = new docusignRooms.RoomsApi(dsApiClient)
        , roomDocuments = null;
  
        roomDocuments = await roomsApi.getDocuments(args.accountId, args.roomId, null, null);
        return roomDocuments;
    }
}

/**
 * Form page for this application
 */
createExternalFormFillSession.getRooms = async (args) => {
    let dsApiClient = new docusignRooms.ApiClient();
    dsApiClient.setBasePath(args.basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    
    let roomsApi = new docusignRooms.RoomsApi(dsApiClient)
      , userRooms = null;
 
    userRooms = await roomsApi.getRooms(args.accountId, {count: 5}/*optional*/, null);

    return userRoomsl
}
