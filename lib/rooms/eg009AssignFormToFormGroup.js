/**
 * @file
 * Example 009: Assign form to form group
 * @author DocuSign
 */

const path = require("path")
    , docusignRooms = require("docusign-rooms")
    , validator = require("validator")
    , dsConfig = require("../../config/index.js").config
;

const eg009AssignFormToFormGroup = exports
    , eg = "eg009rooms"
    , mustAuthenticate = "/ds/mustAuthenticate"
    , minimumBufferMin = 3
;

/**
 * Get form groups
 * @param {object} args
 */
eg009AssignFormToFormGroup.getFormGroups = async (accessToken, accountId) => {
    // Create an API with headers
    let dsApiClient = new docusignRooms.ApiClient();
    dsApiClient.setBasePath(`${dsConfig.roomsApiUrl}/restapi`);
    dsApiClient.addDefaultHeader("Authorization", "Bearer " + accessToken);

    // Step 4 start
    const formsGroupsApi = new docusignRooms.FormGroupsApi(dsApiClient);
    const response =  await formsGroupsApi.getFormGroups(accountId);
    // Step 4 end

    return response;
}

/**
 * Get form libraries
 * @param {object} args
 */
eg009AssignFormToFormGroup.getForms = async (accessToken, accountId) => {
    // Create an API with headers
    let dsApiClient = new docusignRooms.ApiClient();
    dsApiClient.setBasePath(`${dsConfig.roomsApiUrl}/restapi`);
    dsApiClient.addDefaultHeader("Authorization", "Bearer " + accessToken);

    // Get first form library id
    // Step 3 start    
    const formLibrariesApi = new docusignRooms.FormLibrariesApi(dsApiClient);
    const formLibraries = await formLibrariesApi.getFormLibraries(accountId);
    const firstFormLibraryId = formLibraries.formsLibrarySummaries[0].formsLibraryId;
    // Step 3 end

    // Get offices via OfficesApi
    const { forms } = await formLibrariesApi.getFormLibraryForms(accountId, firstFormLibraryId);

    return forms;
}

/**
 * Assign form to form group
 * @param {object} args
 */
eg009AssignFormToFormGroup.worker = async (args) => {
    // Step 2 start
    let dsApiClient = new docusignRooms.ApiClient();
    dsApiClient.setBasePath(`${dsConfig.roomsApiUrl}/restapi`);
    dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
    // Step 2 end

    // Step 6 start
    const formsGroupsApi = new docusignRooms.FormGroupsApi(dsApiClient);
    const formGroupToAssign = new docusignRooms.FormGroupFormToAssign.constructFromObject({
        formId: args.formId, isRequired: true
    })

    // Assign form to a form group via FormGroups API
    const results = await formsGroupsApi.assignFormGroupForm(args.accountId, args.formGroupId, {
        body: formGroupToAssign
    });
    // Step 6 end
    
    console.log(`Form ${args.formId} has been assigned to Form Group ID ${args.formGroupId}`);
    return results;
}

/**
 * Assign form to form group
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg009AssignFormToFormGroup.createController = async (req, res) => {
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user.
    let tokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (!tokenOK) {
        req.flash("info", "Sorry, you need to re-authenticate.");
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }

    let results = null;
    const body = req.body;
    const args = {
        accessToken: req.user.accessToken,
        basePath: req.session.basePath,
        accountId: req.session.accountId,
        formGroupId: validator.escape(body.formGroupId),
        formId: validator.escape(body.formId)
    }
    try {
        results = await eg009AssignFormToFormGroup.worker(args)

        res.render("pages/example_done", {
            title: "Assign form a form group",
            h1: "Assign form a form group",
            message: `Form ${args.formId} has been assigned to Form Group ID ${args.formGroupId}`,
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
eg009AssignFormToFormGroup.getController = async (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        let formGroups, forms;
        try {
            formGroups = await eg009AssignFormToFormGroup.getFormGroups(req.user.accessToken, req.session.accountId);
            forms = await eg009AssignFormToFormGroup.getForms(req.user.accessToken, req.session.accountId);

            res.render("pages/rooms-examples/eg009AssignFormToFormGroup", {
                eg: eg, csrfToken: req.csrfToken(),
                title: "Assign form a form group",
                formGroups: formGroups.formGroups, 
                forms,
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
