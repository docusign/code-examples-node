/**
 * @file
 * Example 002: Create Room From Template
 * @author DocuSign
 */

const path = require('path')
    , createRoomFromTemplate = require('../examples/createRoomFromTemplate')
    , validator = require('validator')
    , dsConfig = require('../../../config/index.js').config
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
            basePath: `${dsConfig.roomsApiUrl}/restapi`,
            accountId: req.session.accountId,
            roomsArgs: roomsArgs
        }
        , results = null
        ;

    try {
        results = await createRoomFromTemplate.createRoom(args)
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
 * Form page for this application
 */
eg002CreateRoomFromTemplate.getController = async (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        const args = {
            accessToken: req.user.accessToken,
            basePath: `${dsConfig.roomsApiUrl}/restapi`,
            accountId: req.session.accountId,
        };
        const userRoomsTemplates = await createRoomFromTemplate.getTemplates(args);

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
