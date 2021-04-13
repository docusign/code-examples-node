/**
 * @file
 * Example 007: Create Form Group
 * @author DocuSign
 */

const path = require("path")
    , docusignRooms = require("docusign-rooms")
    , validator = require("validator")
    , dsConfig = require("../../config/index.js").config
;

const eg007CreateFormGroup = exports
    , eg = "eg007rooms"
    , mustAuthenticate = "/ds/mustAuthenticate"
    , minimumBufferMin = 3
;

/**
 * Create form group
 * @param {object} args
 */
eg007CreateFormGroup.worker = async (args) => {
    // Step 2 start
    let dsApiClient = new docusignRooms.ApiClient();
    dsApiClient.setBasePath(`${dsConfig.roomsApiUrl}/restapi`);
    dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
    // Step 2 end

    // Step 3 start
    const form = new docusignRooms.FormGroupForCreate.constructFromObject({ name: args.formGroupName });
    // Step 3 end

    // Step 4 start
    // Post the form object using SDK
    const formsGroupsApi = new docusignRooms.FormGroupsApi(dsApiClient);
    const results = await formsGroupsApi.createFormGroup(args.accountId, { body: form });
    // Step 4 end

    console.log(`Form Group ${args.formGroupName} has been created. Form Group ID ${results.formGroupId}`);
    return results;
}

/**
 * Create form group
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg007CreateFormGroup.createController = async (req, res) => {
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
    const formGroupName = validator.escape(req.body.formGroupName)
    const args = {
        accessToken: req.user.accessToken,
        basePath: req.session.basePath,
        accountId: req.session.accountId,
        formGroupName
    }
    try {
        results = await eg007CreateFormGroup.worker(args)
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

    if (results) {
        res.render("pages/example_done", {
            title: "Creating a form group",
            h1: "Creating a form group",
            message: `The Form Group ${formGroupName} has been created!<br/> 
                      Form Group ID: ${results.formGroupId}.`,
            json: JSON.stringify(results)
        });
    }
}

/**
 * Form page for this application
 */
eg007CreateFormGroup.getController = async (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        res.render("pages/rooms-examples/eg007CreateFormGroup", {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Creating the form group",
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
