/**
 * @file
 * Example 009: Assign form to form group
 * @author DocuSign
 */

const path = require("path");
const { assignFormToFormGroup, getFormsAndFormGroups } = require("../examples/assignFormToFormGroup");
const validator = require("validator");
const dsConfig = require("../../../config/index.js").config;

const eg009AssignFormToFormGroup = exports;
const eg = "eg009";
const mustAuthenticate = "/ds/mustAuthenticate";
const minimumBufferMin = 3;

/**
 * Assign form to form group
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg009AssignFormToFormGroup.createController = async (req, res) => {
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user.
    const tokenOK = req.dsAuth.checkToken(minimumBufferMin);
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
        basePath: `${dsConfig.roomsApiUrl}/restapi`,
        accountId: req.session.accountId,
        formGroupId: validator.escape(body.formGroupId),
        formId: validator.escape(body.formId)
    };
    try {
        results = await assignFormToFormGroup(args);

        res.render("pages/example_done", {
            title: "Assign form a form group",
            h1: "Assign form a form group",
            message: `Form ${args.formId} has been assigned to Form Group ID ${args.formGroupId}`,
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
eg009AssignFormToFormGroup.getController = async (req, res) => {
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
            const results = await getFormsAndFormGroups(args);

            sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
            res.render("pages/rooms-examples/eg009AssignFormToFormGroup", {
                eg: eg, csrfToken: req.csrfToken(),
                title: "Assign form a form group",
                formGroups: results.formGroups.formGroups,
                forms: results.forms,
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
