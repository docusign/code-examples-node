/**
 * @file
 * Example 003: Export Data From Room
 * @author DocuSign
 */

const path = require('path');
const { exportDataFromRoom, getRooms } = require('../examples/exportDataFromRoom');
const validator = require('validator');
const dsConfig = require('../../../config/index.js').config;

const eg003ExportDataFromRoom = exports;
const eg = 'eg003'; // This example reference.
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;

/**
 * Export data from room
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg003ExportDataFromRoom.createController = async (req, res) => {
    // Step 1. Check the token
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user.
    const tokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (!tokenOK) {
        req.flash('info', 'Sorry, you need to re-authenticate.');
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
    console.log('token', req.user.accessToken)
    // Step 2. Call the worker method
    const { body } = req;
        // Additional data validation might also be appropriate
    const roomId = validator.escape(body.roomId)
    const roomsArgs = {
        roomId
    };
    const args = {
        accessToken: req.user.accessToken,
        basePath: `${dsConfig.roomsApiUrl}/restapi`,
        accountId: req.session.accountId,
        roomsArgs: roomsArgs
    };
    let results = null;

    try {
        results = await exportDataFromRoom(args);
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
            title: "The room data was successfully exported",
            h1: "The room data was successfully exported",
            message: `Results from the Rooms::GetRoomFieldData method RoomId: ${roomId} :`,
            json: JSON.stringify(results)
        });
    }
}

/**
 * Form page for this application
 */
eg003ExportDataFromRoom.getController = async (req, res) => {
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
        const userRooms = await getRooms(args);

        sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
        res.render('pages/rooms-examples/eg003ExportDataFromRoom', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Export Data From Room",
            sourceFile: sourceFile,
            sourceUrl: dsConfig.githubExampleUrl + 'rooms/examples/' + sourceFile,
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
