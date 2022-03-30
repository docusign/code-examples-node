/**
 * @file
 * Example 004: Adding Form To Room
 * @author DocuSign
 */

const path = require('path');
const { addFormToRoom, getFormsAndRooms } = require('../examples/addingFormToRoom');
const validator = require('validator');
const dsConfig = require('../../../config/index.js').config;

const eg004AddingFormToRoom = exports;
const eg = 'eg004'; // This example reference.
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;

/**
 * Add form to a room
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg004AddingFormToRoom.createController = async (req, res) => {
    // Check the token
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user.
    const tokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (!tokenOK) {
        req.flash('info', 'Sorry, you need to re-authenticate.');
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
    // Step 2. Call the worker method
    const { body } = req;
    // Additional data validation might also be appropriate
    const roomId = validator.escape(body.roomId)
    const libraryFormId = validator.escape(body.libraryFormId)
    const roomsArgs = {
        roomId: roomId,
        libraryFormId: libraryFormId
    };
    const args = {
        accessToken: req.user.accessToken,
        basePath: `${dsConfig.roomsApiUrl}/restapi`,
        accountId: req.session.accountId,
        roomsArgs: roomsArgs
    };
    let results = null;

    try {
        results = await addFormToRoom(args);
    }
    catch (error) {
        const errorBody = error && error.response && error.response.body;
        // we can pull the DocuSign error code and message from the response body
        const errorCode = errorBody && errorBody.errorCode;
        const errorMessage = errorBody && errorBody.message;
        // In production, may want to provide customized error messages and
        // remediation advice to the user.
        res.render('pages/error', { err: error, errorCode, errorMessage });
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
 * Form page for this application
 */
eg004AddingFormToRoom.getController = async (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    const tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        const args = {
            accessToken: req.user.accessToken,
            basePath: `${dsConfig.roomsApiUrl}/restapi`,
            accountId: req.session.accountId,
        };
        const results = await getFormsAndRooms(args);

        sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
        res.render('pages/rooms-examples/eg004AddingFormToRoom', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Adding Form To Room",
            sourceFile: sourceFile,
            sourceUrl: dsConfig.githubExampleUrl + 'rooms/examples/' + sourceFile,
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation,
            forms: results.formsResults.forms,
            rooms: results.userRooms.rooms
        });
    } else {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
}
