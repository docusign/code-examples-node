/**
 * @file
 * Example 004: Adding Form To Room
 * @author DocuSign
 */

const path = require('path')
    , docusignRooms = require('docusign-rooms')
    , validator = require('validator')
    , dsConfig = require('../../config/index.js').config
    ;

const eg004AddingFormToRoom = exports
    , eg = 'eg004rooms' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    ;

/**
 * Add form to a room
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg004AddingFormToRoom.createController = async (req, res) => {
    // Check the token
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user.
    let tokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (!tokenOK) {
        req.flash('info', 'Sorry, you need to re-authenticate.');
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
    // Step 2. Call the worker method
    let body = req.body
        // Additional data validation might also be appropriate
        , roomId = validator.escape(body.roomId)
        , libraryFormId = validator.escape(body.libraryFormId)
        , roomsArgs = {
            roomId: roomId,
            libraryFormId: libraryFormId
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
        results = await eg004AddingFormToRoom.worker(args)
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
            title: 'The form was successfully added to a room',
            h1: `The form was successfully added to a room`,
            message: `Results from the Rooms: AddFormToRoom method. RoomId: ${roomId}, FormId: ${libraryFormId}.`,
            json: JSON.stringify(results)
        });
    }
}

/**
 * This function does creation of the room with data
 * @param {object} args
 */
eg004AddingFormToRoom.worker = async (args) => {

    // Step 2 start
    let dsApiClient = new docusignRooms.ApiClient();
    dsApiClient.setBasePath(`${dsConfig.roomsApiUrl}/restapi`);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    // Step 2 end
    
    // Step 4 start
    let roomsApi = new docusignRooms.RoomsApi(dsApiClient)
        , results = null;

    results = roomsApi.addFormToRoom(args.accountId, args.roomsArgs.roomId, {body: {formId: args.roomsArgs.libraryFormId}}, null);
    // Step 4 end

    console.log(`Room with data was created. RoomId ${results.roomId}`);  
    return results;
}

/**
 * Form page for this application
 */
eg004AddingFormToRoom.getController = async (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {

        let dsApiClient = new docusignRooms.ApiClient();
        dsApiClient.setBasePath(`${dsConfig.roomsApiUrl}/restapi`);
        dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + req.user.accessToken);
       
        // Step 3 start
        let formLibrariesApi = new docusignRooms.FormLibrariesApi(dsApiClient)
        , formLibrariesResults = null;

        formLibrariesResults = await formLibrariesApi.getFormLibraries(req.session.accountId);
    
        if(formLibrariesResults.formsLibrarySummaries.length === 0) {
            return;
        }

        const formsResults = await formLibrariesApi.getFormLibraryForms(req.session.accountId, 
            formLibrariesResults.formsLibrarySummaries[0].formsLibraryId);
        // Step 3 end

        let roomsApi = new docusignRooms.RoomsApi(dsApiClient)
        , userRooms = null;
 
        userRooms = await roomsApi.getRooms(req.session.accountId, {count: 5}/*optional*/, null);

        res.render('pages/rooms-examples/eg004AddingFormToRoom', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Adding Form To Room",
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubRoomsExampleUrl + path.basename(__filename),
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation,
            forms: formsResults.forms,
            rooms: userRooms.rooms
        });
    } else {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
}
