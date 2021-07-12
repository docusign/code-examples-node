/**
 * @file
 * Example 003: Export Data From Room
 * @author DocuSign
 */

const path = require('path')
    , docusignRooms = require('docusign-rooms')
    , validator = require('validator')
    , dsConfig = require('../../config/index.js').config
    ;

const eg003ExportDataFromRoom = exports
    , eg = 'eg003rooms' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    ;

    var roomId = null;
    
/**
 * Export data from room
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg003ExportDataFromRoom.createController = async (req, res) => {
    // Step 1. Check the token
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user.
    let tokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (!tokenOK) {
        req.flash('info', 'Sorry, you need to re-authenticate.');
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
    console.log('token', req.user.accessToken)
    // Step 2. Call the worker method
    let body = req.body
        // Additional data validation might also be appropriate
        , roomId = validator.escape(body.roomId)
        , roomsArgs = {
            roomId: roomId
        }
        , args = {
            accessToken: req.user.accessToken,
            basePath: req.session.basePath,
            accountId: req.session.accountId,
            roomsArgs: roomsArgs
        }
        , results = null
        ;

    try {
        roomId = args.roomsArgs.roomId;
        results = await eg003ExportDataFromRoom.worker(args)
    }
    catch (error) {
        let errorBody = error && error.response && error.response.body
            // we can pull the DocuSign error code and message from the response body
            , errorCode = errorBody && errorBody.errorCode
            , errorMessage = errorBody && errorBody.message
            ;
        // In production, may want to provide customized error messages and
        // remediation advice to the user.
        res.render('pages/error', { err: error, errorCode: errorCode, errorMessage: errorMessage });
    }
 
    if (results) {
        res.render('pages/example_done', {
            title: "The room data was successfully exported",
            h1: "The room data was successfully exported",
            message: `Results from the Rooms::GetRoomFieldData method RoomId: ${roomId} :`,
            json: JSON.stringify(results)
        });
    }
}

/**
 * Get Room Field Data
 * @param {object} args
 */
eg003ExportDataFromRoom.worker = async (args) => {
    
    // Step 2 start
    let dsApiClient = new docusignRooms.ApiClient();
    
    dsApiClient.setBasePath(`${dsConfig.roomsApiUrl}/restapi`);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    // Step 2 end

    // Step 3 start
    let roomsApi = new docusignRooms.RoomsApi(dsApiClient)
        , results = null;
    results = roomsApi.getRoomFieldData(args.accountId, args.roomsArgs.roomId);
    // Step 3 end

    console.log(`Rooms Data retrieved: ${JSON.stringify(results)}`);
    return results;
    
}

/**
 * Form page for this application
 */
eg003ExportDataFromRoom.getController = async (req, res) => {
    console.log(req.dsAuth);
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        let dsApiClient = new docusignRooms.ApiClient();
        dsApiClient.setBasePath(`${dsConfig.roomsApiUrl}/restapi`);
        dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + req.user.accessToken);

        let roomsApi = new docusignRooms.RoomsApi(dsApiClient)
        , userRooms = null;
 
        userRooms = await roomsApi.getRooms(req.session.accountId, {count: 5}/*optional*/, null);

        res.render('pages/rooms-examples/eg003ExportDataFromRoom', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Export Data From Room",
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubRoomsExampleUrl + path.basename(__filename),
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation,
            rooms: userRooms.rooms || [],
        });
    } else {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
}
