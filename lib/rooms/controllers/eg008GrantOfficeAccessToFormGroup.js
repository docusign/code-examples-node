/**
 * @file
 * Example 008: Grant office access to form group
 * @author DocuSign
 */

const path = require("path");
const { grantOfficeAccessToFormGroup, getFormGroupsAndOffices } = require("../examples/grantOfficeAccessToFormGroup");
const validator = require("validator");
const dsConfig = require("../../../config/index.js").config;

const eg008GrantOfficeAccessToFormGroup = exports;
const eg = "eg008";
const mustAuthenticate = "/ds/mustAuthenticate";
const minimumBufferMin = 3;

/**
 * Grant office access to form group
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg008GrantOfficeAccessToFormGroup.createController = async (req, res) => {
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user.
    const tokenOK = req.dsAuth.checkToken(minimumBufferMin);
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
    };
    try {
        results = await grantOfficeAccessToFormGroup(args);

        res.render("pages/example_done", {
            title: "Grant office access to form group",
            h1: "Grant office access to form group",
            message: `Office ${args.officeId} has been assigned to Form Group ID ${args.formGroupId}`,
        });
    }
    catch (error) {
        const errorBody = error && error.response && error.response.body;
        // we can pull the DocuSign error code and message from the response body
        const errorCode = errorBody && errorBody.errorCode;
        const errorMessage = errorBody && errorBody.message;
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
    const tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        try {
            const args = {
                accessToken: req.user.accessToken,
                basePath: `${dsConfig.roomsApiUrl}/restapi`,
                accountId: req.session.accountId,
            };

            const results = await getFormGroupsAndOffices(args);

            sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
            res.render("pages/rooms-examples/eg008GrantOfficeAccessToFormGroup", {
                eg: eg, csrfToken: req.csrfToken(),
                title: "Grant office access to form group",
                formGroups: results.formGroups,
                offices: results.offices,
                sourceFile: sourceFile,
                sourceUrl: dsConfig.githubExampleUrl + 'rooms/examples/' + sourceFile,
                documentation: dsConfig.documentation + eg,
                showDoc: dsConfig.documentation
            });
        }
        catch (error) {
            const errorBody = error && error.response && error.response.body;
            // we can pull the DocuSign error code and message from the response body
            const errorCode = errorBody && errorBody.errorCode
            const errorMessage = errorBody && errorBody.message;
            // In production, may want to provide customized error messages and
            // remediation advice to the user.
            res.render("pages/error", { err: error, errorCode, errorMessage });
        }
    } else {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
}
