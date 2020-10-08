/**
 * @file
 * Example 005: Get Rooms With Filters
 * @author DocuSign
 */

const path = require('path')
    , docusignRooms = require('docusign-rooms')
    , validator = require('validator')
    , moment = require('moment')
    , dsConfig = require('../../config/index.js').config
    ;

const eg005GetRoomsWithFilters = exports
    , eg = 'eg005rooms' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    ;

/**
 * Get Rooms with filters
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg005GetRoomsWithFilters.createController = async (req, res) => {
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
        , roomsArgs = {
            fieldDataChangedStartDate: moment().subtract(30, 'days').format(),
            fieldDataChangedEndDate: moment().format()        
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
        console.log(results)
        results = await eg005GetRoomsWithFilters.worker(args)
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
 * Get filtered rooms
 * @param {object} args
 */
eg005GetRoomsWithFilters.worker = async (args) => {
    let dsApiClient = new docusignRooms.ApiClient();
    
    dsApiClient.setBasePath(`${dsConfig.roomsApiUrl}/restapi`);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    let roomsApi = new docusignRooms.RoomsApi(dsApiClient)
        , results = null;

    results = await roomsApi.getRooms(args.accountId, args.roomsArgs);
    console.log(`Get Rooms with filters ${JSON.stringify(results)}`);

    return results;
    
}

/**
 * Form page for this application
 */
eg005GetRoomsWithFilters.getController = (req, res) => {
    console.log(req.dsAuth);
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        res.render('pages/rooms-examples/eg005GetRoomsWithFilters', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Create Room with Data",
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubRoomsExampleUrl + path.basename(__filename),
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation
        });
    } else {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
}
