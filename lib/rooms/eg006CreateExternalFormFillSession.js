/**
 * @file
 * Example 006: Create External Form Fill Session
 * @author DocuSign
 */

const { json } = require('body-parser');

const path = require('path')
    , docusignRooms = require('docusign-rooms')
    , validator = require('validator')
    , dsConfig = require('../../config/index.js').config
    ;

const eg006CreateExternalFormFillSession = exports
    , eg = 'eg006rooms' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    ;

/**
 * Select Room for External Form Fill Session creation
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg006CreateExternalFormFillSession.createController = async (req, res) => {
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

    let body = req.body
        // Additional data validation might also be appropriate
        , roomId = validator.escape(body.roomId)
        , docuSignFormId = body.docuSignFormId;
        
        // Step 2 start
        let dsApiClient = new docusignRooms.ApiClient();
        dsApiClient.setBasePath(`${dsConfig.roomsApiUrl}/restapi`);
        dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + req.user.accessToken);
        // Step 2 end

        if(docuSignFormId) {
            // Step 4 start
            let externalFormFillSessionApi = new docusignRooms.ExternalFormFillSessionsApi(dsApiClient)
            , externalForm = null;

            externalForm = await externalFormFillSessionApi.createExternalFormFillSession(req.session.accountId, {body:{ formId: docuSignFormId, roomId }},
                 null);
            // Step 4 end

            console.log(`External form fill session ${JSON.stringify(externalForm)}`);
            if (externalForm) {
                res.render('pages/example_done', {
                    title: "External form fill session was successfully created",
                    h1: "External form fill session was successfully created",
                    message: `To fill the form navigate the following URL: <a href='${externalForm.url}'>Fill the form</a>`,
                    json: JSON.stringify(externalForm)
                });
            }
        } else {
            let roomsApi = new docusignRooms.RoomsApi(dsApiClient)
            , roomDocuments = null;
    
            roomDocuments = await roomsApi.getDocuments(req.session.accountId, roomId, null, null);

            res.render('pages/rooms-examples/eg006CreateExternalFormFillSession', {
                eg: eg, csrfToken: req.csrfToken(),
                title: "Create External Form Fill Session",
                sourceFile: path.basename(__filename),
                sourceUrl: dsConfig.githubRoomsExampleUrl + path.basename(__filename),
                documentation: dsConfig.documentation + eg,
                showDoc: dsConfig.documentation,
                documents: roomDocuments.documents,
                roomId: roomId
            });
        }
}

/**
 * Form page for this application
 */
eg006CreateExternalFormFillSession.getController = async (req, res) => {
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

        res.render('pages/rooms-examples/eg006SelectRoomForExternalFormFillSession', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Create External Form Fill Session",
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubRoomsExampleUrl + path.basename(__filename),
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation,
            rooms: userRooms.rooms
        });
    } else {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
}
