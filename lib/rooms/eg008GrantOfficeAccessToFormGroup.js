/**
 * @file
 * Example 008: Grant office access to form group
 * @author DocuSign
 */

const path = require("path")
    , docusignRooms = require("docusign-rooms")
    , validator = require("validator")
    , dsConfig = require("../../config/index.js").config
;

const eg008GrantOfficeAccessToFormGroup = exports
    , eg = "eg008rooms"
    , mustAuthenticate = "/ds/mustAuthenticate"
    , minimumBufferMin = 3
;

/**
 * Get form groups
 * @param {object} args
 */
eg008GrantOfficeAccessToFormGroup.getFormGroups = async (accessToken, accountId) => {
    // Create an API with headers
    let dsApiClient = new docusignRooms.ApiClient();
    dsApiClient.setBasePath(`${dsConfig.roomsApiUrl}/restapi`);
    dsApiClient.addDefaultHeader("Authorization", "Bearer " + accessToken);

    // GET Form Groups via FormGroupsAPI
    // Step 4 start
    const formsGroupsApi = new docusignRooms.FormGroupsApi(dsApiClient);
    const results = await formsGroupsApi.getFormGroups(accountId);
    // Step 4 end

    return results.formGroups
}

/**
 * Get offices
 * @param {object} args
 */
eg008GrantOfficeAccessToFormGroup.getOffices = async (accessToken, accountId) => {
    // Create an API with headers
    let dsApiClient = new docusignRooms.ApiClient();
    dsApiClient.setBasePath(`${dsConfig.roomsApiUrl}/restapi`);
    dsApiClient.addDefaultHeader("Authorization", "Bearer " + accessToken);

    // GET offices via OfficesApi
    // Step 3 start 
    const officesApi = new docusignRooms.OfficesApi(dsApiClient);
    const results = await officesApi.getOffices(accountId);
    // Step 3 end

    return results.officeSummaries
}

/**
 * Grant office access to form group
 * @param {object} args
 */
eg008GrantOfficeAccessToFormGroup.worker = async (args) => {
    // Create an API with headers
    // Step 2 start
    let dsApiClient = new docusignRooms.ApiClient();
    dsApiClient.setBasePath(`${dsConfig.roomsApiUrl}/restapi`);
    dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
    // Step 2 end

    // Post the form object using SDK
    // Step 5 start
    const formsGroupsApi = new docusignRooms.FormGroupsApi(dsApiClient);
    const results = await formsGroupsApi.grantOfficeAccessToFormGroup(args.accountId, args.formGroupId, args.officeId);
    // Step 5 end

    console.log(`Office ${args.officeId} has been assigned to Form Group ID ${args.formGroupId}`);
    return results;
}

/**
 * Grant office access to form group
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg008GrantOfficeAccessToFormGroup.createController = async (req, res) => {
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user.
    let tokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (!tokenOK) {
        req.flash("info", "Sorry, you need to re-authenticate.");
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }

    // Call the worker method
    let results = null;
    const body = req.body;
    const args = {
        accessToken: req.user.accessToken,
        basePath: req.session.basePath,
        accountId: req.session.accountId,
        formGroupId: validator.escape(body.formGroupId),
        officeId: validator.escape(body.officeId)
    }
    try {
        results = await eg008GrantOfficeAccessToFormGroup.worker(args)
        
        res.render("pages/example_done", {
            title: "Grant office access to form group",
            h1: "Grant office access to form group",
            message: `Office ${args.officeId} has been assigned to Form Group ID ${args.formGroupId}`,
        });
    }
    catch (error) {
        let errorBody = error && error.response && error.response.body
            // we can pull the DocuSign error code and message from the response body
            , errorCode = errorBody && errorBody.errorCode
            , errorMessage = errorBody && errorBody.message
        ;
        // In production, may want to provide customized error messages and
        // remediation advice to the user.
        res.render("pages/error", { err: error, errorCode, errorMessage });
    }
}

/**
 * Form page for this application
 */
eg008GrantOfficeAccessToFormGroup.getController = async (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        let formGroups, offices;
        try {
            formGroups = await eg008GrantOfficeAccessToFormGroup.getFormGroups(req.user.accessToken, req.session.accountId);
            offices = await eg008GrantOfficeAccessToFormGroup.getOffices(req.user.accessToken, req.session.accountId);
            res.render("pages/rooms-examples/eg008GrantOfficeAccessToFormGroup", {
                eg: eg, csrfToken: req.csrfToken(),
                title: "Grant office access to form group",
                formGroups, offices,
                sourceFile: path.basename(__filename),
                sourceUrl: dsConfig.githubRoomsExampleUrl + path.basename(__filename),
                documentation: dsConfig.documentation + eg,
                showDoc: dsConfig.documentation
            });
        }
        catch (error) {
            let errorBody = error && error.response && error.response.body
                // we can pull the DocuSign error code and message from the response body
                , errorCode = errorBody && errorBody.errorCode
                , errorMessage = errorBody && errorBody.message
            ;
            // In production, may want to provide customized error messages and
            // remediation advice to the user.
            res.render("pages/error", { err: error, errorCode: errorCode, errorMessage: errorMessage });
        }
    } else {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
}
