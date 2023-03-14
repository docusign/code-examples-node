/**
 * @file
 * Example 006: Create External Form Fill Session
 * @author DocuSign
 */

const path = require('path');
const { createExternalFormFillSession, getRooms } = require('../examples/createExternalFormFillSession');
const validator = require('validator');
const { getExampleByNumber } = require("../../manifestService");
const dsConfig = require('../../../config/index.js').config;
const { formatString, API_TYPES } = require('../../utils.js');

const eg006CreateExternalFormFillSession = exports;
const exampleNumber = 6;
const eg = `reg00${exampleNumber}`; // This example reference.
const api = API_TYPES.ROOMS;
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
    const isTokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (!isTokenOK) {
        req.flash('info', 'Sorry, you need to re-authenticate.');
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        return res.redirect(mustAuthenticate);
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

    try {
        const results = await createExternalFormFillSession(args);

        const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
        if(docuSignFormId) {
            if (results) {
                res.render('pages/eg006RoomsExampleDone', {
                    title: example.ExampleName,
                    message: formatString(example.ResultsPageText, results.url),
                    url: results.url,
                    json: JSON.stringify(results)
                });
            }
        } else {
            res.render('pages/rooms-examples/eg006CreateExternalFormFillSession', {
                eg: eg, csrfToken: req.csrfToken(),
                example: example,
                sourceFile: path.basename(__filename),
                sourceUrl: dsConfig.githubRoomsExampleUrl + path.basename(__filename),
                documentation: dsConfig.documentation + eg,
                showDoc: dsConfig.documentation,
                documents: results.documents,
                roomId: roomId
            });
        }
    } catch (error) {
        const errorBody = error && error.response && error.response.body;
        // we can pull the DocuSign error code and message from the response body
        const errorCode = errorBody && errorBody.errorCode;
        const errorMessage = errorBody && errorBody.message;
        // In production, may want to provide customized error messages and
        // remediation advice to the user.
        res.render('pages/error', { err: error, errorCode, errorMessage });
    }
}

/**
 * Form page for this application
 */
eg006CreateExternalFormFillSession.getController = async (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    const isTokenOK = req.dsAuth.checkToken();
    if (!isTokenOK) {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        return res.redirect(mustAuthenticate);
    }

    const args = {
        accessToken: req.user.accessToken,
        basePath: `${dsConfig.roomsApiUrl}/restapi`,
        accountId: req.session.accountId,
    };

    let userRooms = null;
    
    try {
        userRooms = await getRooms(args);
    } catch (error) {
      const errorBody = error && error.response && error.response.body;
      const errorCode = errorBody && errorBody.errorCode;
      const errorMessage = errorBody && errorBody.message;

      res.render("pages/error", { err: error, errorCode, errorMessage });
    }
    if (userRooms) {
        const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
        const sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
        res.render('pages/rooms-examples/eg006SelectRoomForExternalFormFillSession', {
            eg: eg, csrfToken: req.csrfToken(),
            example: example,
            sourceFile: sourceFile,
            sourceUrl: dsConfig.githubExampleUrl + 'rooms/examples/' + sourceFile,
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation,
            rooms: userRooms.rooms
        });
    }

}
