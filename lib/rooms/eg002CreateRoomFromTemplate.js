/**
 * @file
 * Example 002: Create Room From Template
 * @author DocuSign
 */

const path = require('path')
    , docusignRooms = require('docusign-rooms')
    , validator = require('validator')
    , dsConfig = require('../../config/index.js').config
    ;

const eg002CreateRoomFromTemplate = exports
    , eg = 'eg002rooms' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    ;

/**
 * Create room from template
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg002CreateRoomFromTemplate.createController = async (req, res) => {
    // Step 1. Check the token
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user.
    let tokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (!tokenOK) {
        req.flash('info', 'Sorry, you need to re-authenticate.');
        // We could store the parameters of the requested operation
        // so it could be restarted automatically.
        // But since it should be rare to have a token issue here,
        // we'll make the user re-enter the form data after
        // authentication.
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
    console.log('token', req.user.accessToken)
    // Step 2. Call the worker method
    let body = req.body
        // Additional data validation might also be appropriate
        , templateId = validator.escape(body.templateId)
        , roomName = validator.escape(body.roomName)
        , roomsArgs = {
            templateId: templateId,
            roomName: roomName
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
        results = await eg002CreateRoomFromTemplate.worker(args)
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
            title: "The room was successfully created",
            h1: "The room was successfully created",
            message: `The room was created! Room ID: ${results.roomId}, Name: ${results.name}.`
        });
    }
}

/**
 * This function does creation of the room with data
 * @param {object} args
 */
eg002CreateRoomFromTemplate.worker = async (args) => {
    let dsApiClient = new docusignRooms.ApiClient();
    
    dsApiClient.setBasePath(`${dsConfig.roomsApiUrl}/restapi`);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    let roomsApi = new docusignRooms.RoomsApi(dsApiClient)
        , results = null;
    let rolesApi = new docusignRooms.RolesApi(dsApiClient)
        , rolesResult = null;

    rolesResult = await rolesApi.getRoles(args.accountId);
    console.log(rolesResult)
    args.roleId = rolesResult.roles[0].roleId;
    let roomWithData = makeRoomsWithData(args)

    results = await roomsApi.createRoom(roomWithData, args.accountId, null);
    console.log(`Room with data was created. RoomId ${results.roomId}`);
    return results;
}

function makeRoomsWithData(args) {
    return {
        name: args.roomsArgs.roomName,
        roleId: args.roleId,
        templateId: args.roomsArgs.templateId,
        transactionSideId: "listbuy",
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
                culpa qui officia deserunt mollit anim id est laborum.`
            }
        }
    }
}

/**
 * Form page for this application
 */
eg002CreateRoomFromTemplate.getController = async (req, res) => {
    console.log(req.dsAuth);
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        
        let dsApiClient = new docusignRooms.ApiClient();
        dsApiClient.setBasePath(`${dsConfig.roomsApiUrl}/restapi`);
        dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + req.user.accessToken);

        let roomTemplatesApi = new docusignRooms.RoomTemplatesApi(dsApiClient)
        , userRoomsTemplates = null;
 
        userRoomsTemplates = await roomTemplatesApi.getRoomTemplates(req.session.accountId, null, null);
        console.log(userRoomsTemplates)
        res.render('pages/rooms-examples/eg002CreateRoomFromTemplate', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Create Room from template",
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubRoomsExampleUrl + path.basename(__filename),
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation,
            templates: userRoomsTemplates.roomTemplates || [],
        });
    } else {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
}
