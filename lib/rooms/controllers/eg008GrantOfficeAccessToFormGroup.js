/**
 * @file
 * Example 008: Grant office access to form group
 * @author DocuSign
 */

const path = require("path")
    , grantOfficeAccessToFormGroup = require("../examples/grantOfficeAccessToFormGroup")
    , validator = require("validator")
    , dsConfig = require("../../../config/index.js").config
;

const eg008GrantOfficeAccessToFormGroup = exports
    , eg = "eg008rooms"
    , mustAuthenticate = "/ds/mustAuthenticate"
    , minimumBufferMin = 3
;

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
        basePath: `${dsConfig.roomsApiUrl}/restapi`,
        accountId: req.session.accountId,
        formGroupId: validator.escape(body.formGroupId),
        officeId: validator.escape(body.officeId)
    }
    try {
        results = await grantOfficeAccessToFormGroup.grantAccess(args)
        
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
        try {
            const args = {
                accessToken: req.user.accessToken,
                basePath: `${dsConfig.roomsApiUrl}/restapi`,
                accountId: req.session.accountId,
            };

            const results = await grantOfficeAccessToFormGroup.getFormGroupsAndOffices(args);

            res.render("pages/rooms-examples/eg008GrantOfficeAccessToFormGroup", {
                eg: eg, csrfToken: req.csrfToken(),
                title: "Grant office access to form group",
                formGroups: results.formGroups, 
                offices: results.offices,
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
