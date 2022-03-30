/**
 * @file
 * Example 005: Get Rooms With Filters
 * @author DocuSign
 */

const path = require('path');
const { getRoomsWithFilters } = require('../examples/getRoomsWithFilters');
const moment = require('moment');
const dsConfig = require('../../../config/index.js').config;

const eg005GetRoomsWithFilters = exports;
const eg = 'eg005'; // This example reference.
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;

/**
 * Get Rooms with filters
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg005GetRoomsWithFilters.createController = async (req, res) => {
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
    console.log('token', req.user.accessToken)
    // Call the worker method
    // Step 3 start
    const roomsArgs = {
        fieldDataChangedStartDate: moment().subtract(30, 'days').format(),
        fieldDataChangedEndDate: moment().format()
    };
    // Step 3 end
    const args = {
        accessToken: req.user.accessToken,
        basePath: `${dsConfig.roomsApiUrl}/restapi`,
        accountId: req.session.accountId,
        roomsArgs: roomsArgs
    };
    let results = null;

    try {
        console.log(results)
        results = await getRoomsWithFilters(args);
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
            title: "The rooms with filters were loaded",
            h1: "The rooms with filters were loaded",
            message: `Results from the Rooms: GetRooms method.
            FieldDataChangedStartDate: ${ args.roomsArgs.fieldDataChangedStartDate },
            FieldDataChangedEndDate: ${ args.roomsArgs.fieldDataChangedEndDate }`,
            json: JSON.stringify(results)
        });
    }
}

/**
 * Form page for this application
 */
eg005GetRoomsWithFilters.getController = (req, res) => {
    console.log(req.dsAuth);
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    const tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
        res.render('pages/rooms-examples/eg005GetRoomsWithFilters', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Create Room with Data",
            sourceFile: sourceFile,
            sourceUrl: dsConfig.githubExampleUrl + 'rooms/examples/' + sourceFile,
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation
        });
    } else {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
}
