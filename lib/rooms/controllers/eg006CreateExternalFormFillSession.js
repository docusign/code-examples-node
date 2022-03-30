/**
 * @file
 * Example 006: Create External Form Fill Session
 * @author DocuSign
 */

const path = require('path');
const { createExternalFormFillSession, getRooms } = require('../examples/createExternalFormFillSession');
const validator = require('validator');
const dsConfig = require('../../../config/index.js').config;

const eg006CreateExternalFormFillSession = exports;
const eg = 'eg006'; // This example reference.
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;

/**
 * Select Room for External Form Fill Session creation
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg006CreateExternalFormFillSession.createController = async (req, res) => {
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

    const { body } = req;
        // Additional data validation might also be appropriate
    const roomId = validator.escape(body.roomId)
    const docuSignFormId = body.docuSignFormId;
    const args = {
        accessToken: req.user.accessToken,
        basePath: `${dsConfig.roomsApiUrl}/restapi`,
        accountId: req.session.accountId,
        roomId: roomId,
        docuSignFormId: docuSignFormId,
    };

    const results = await createExternalFormFillSession(args);

    if(docuSignFormId) {
        if (results) {
            res.render('pages/example_done', {
                title: "External form fill session was successfully created",
                h1: "External form fill session was successfully created",
                message: `To fill the form navigate the following URL: <a href='${results.url}'>Fill the form</a>`,
                json: JSON.stringify(results)
            });
        }
    } else {
        res.render('pages/rooms-examples/eg006CreateExternalFormFillSession', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Create External Form Fill Session",
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubRoomsExampleUrl + path.basename(__filename),
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation,
            documents: results.documents,
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
    const tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        const args = {
            accessToken: req.user.accessToken,
            basePath: `${dsConfig.roomsApiUrl}/restapi`,
            accountId: req.session.accountId,
        };

        const userRooms = await getRooms(args);

        sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
        res.render('pages/rooms-examples/eg006SelectRoomForExternalFormFillSession', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Create External Form Fill Session",
            sourceFile: sourceFile,
            sourceUrl: dsConfig.githubExampleUrl + 'rooms/examples/' + sourceFile,
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
