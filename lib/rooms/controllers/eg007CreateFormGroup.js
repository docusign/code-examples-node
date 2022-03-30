/**
 * @file
 * Example 007: Create Form Group
 * @author DocuSign
 */

const path = require("path");
const { createFormGroup } = require("../examples/createFormGroup");
const validator = require("validator");
const dsConfig = require("../../../config/index.js").config;

const eg007CreateFormGroup = exports;
const eg = "eg007";
const mustAuthenticate = "/ds/mustAuthenticate";
const minimumBufferMin = 3;

/**
 * Create form group
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg007CreateFormGroup.createController = async (req, res) => {
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
    const formGroupName = validator.escape(req.body.formGroupName);
    const args = {
        accessToken: req.user.accessToken,
        basePath: `${dsConfig.roomsApiUrl}/restapi`,
        accountId: req.session.accountId,
        formGroupName
    };
    try {
        results = await createFormGroup(args);
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
    const tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
        res.render("pages/rooms-examples/eg007CreateFormGroup", {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Creating the form group",
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
