/**
 * @file
 * Example 001: Create Room With Data
 * @author DocuSign
 */

const path = require('path');
const { createRoomWithData } = require('../examples/createRoomWithData');
const validator = require('validator');
const { getExampleByNumber } = require("../../manifestService");
const dsConfig = require('../../../config/index.js').config;
const { formatString, API_TYPES } = require('../../utils.js');

const eg001CreateRoomWithData = exports;
const exampleNumber = 1;
const eg = `reg00${exampleNumber}`; // This example reference.
const api = API_TYPES.ROOMS;
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;

/**
 * Create room
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg001CreateRoomWithData.createController = async (req, res) => {
    // Check the token
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user.
    const isTokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (!isTokenOK) {
        req.flash('info', 'Sorry, you need to re-authenticate.');
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        return res.redirect(mustAuthenticate);
    }
    console.log('token', req.user.accessToken)
    // Call the worker method
    const { body } = req;
        // Additional data validation
    const roomsWithDataArgs = {
        roomName: validator.escape(body.roomName)
    };
    const args = {
        accessToken: req.user.accessToken,
        basePath: `${dsConfig.roomsApiUrl}/restapi`,
        accountId: req.session.accountId,
        roomsWithDataArgs: roomsWithDataArgs
    };
    let results = null;

    try {
        results = await createRoomWithData(args);
    } catch (error) {
        const errorBody = error && error.response && error.response.body;
        // we can pull the DocuSign error code and message from the response body
        const errorCode = errorBody && errorBody.errorCode;
        const errorMessage = errorBody && errorBody.message;
        // In production, may want to provide customized error messages and
        // remediation advice to the user.
        res.render('pages/error', { err: error, errorCode, errorMessage });
    }

    if (results) {
        const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
        res.render('pages/example_done', {
            title: example.ExampleName,
            message: formatString(example.ResultsPageText, results.name, results.roomId)
        });
    }
}

/**
 * Form page for this application
 */
eg001CreateRoomWithData.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    const isTokenOK = req.dsAuth.checkToken();
    if (!isTokenOK) {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        return res.redirect(mustAuthenticate);
    }

    const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
    const sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
    res.render('pages/rooms-examples/eg001CreateRoomWithData', {
        eg: eg, csrfToken: req.csrfToken(),
        example: example,
        sourceFile: sourceFile,
        sourceUrl: dsConfig.githubExampleUrl + 'rooms/examples/' + sourceFile,
        documentation: dsConfig.documentation + eg,
        showDoc: dsConfig.documentation
    });
}
