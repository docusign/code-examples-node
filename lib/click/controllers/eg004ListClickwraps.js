/**
 * @file
 * Example 4: Get list of clickwraps
 * @author DocuSign
 */

const path = require("path");
const dsConfig = require("../../../config/index.js").config;
const { getClickwraps } = require("../examples/listClickwraps");

const eg004ListClickwraps = exports;
const eg = "eg004";
const mustAuthenticate = "/ds/mustAuthenticate";
const minimumBufferMin = 3;

/**
 * Render page with our form for the example
 * @param {Object} req Request obj
 * @param {Object} res Response obj
 */
eg004ListClickwraps.createController = async (req, res) => {
    // Step 1. Check the token
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user
    const tokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (!tokenOK) {
        req.flash("info", "Sorry, you need to re-authenticate.");
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }

    // Get required arguments
    let results = null;
    const args = {
        accessToken: req.user.accessToken,
        basePath: dsConfig.clickAPIUrl,
        accountId: req.session.accountId,
    };

    // Call the worker method
    try {
        results = await getClickwraps(args);
    }
    catch (error) {
        const errorBody = error && error.response && error.response.body;
        // We can pull the DocuSign error code and message from the response body
        const errorCode = errorBody && errorBody.errorCode;
        const errorMessage = errorBody && errorBody.message;
        // In production, you may want to provide customized error messages and
        // remediation advice to the user
        res.render("pages/error", { err: error, errorCode, errorMessage });
    }

    if (results) {
        // Save for use by other examples that need an clickwrapId
        res.render("pages/example_done", {
            title: "Get a list of clickwraps",
            h1: "Get a list of clickwraps",
            message: "Results from the ClickWraps::getClickwraps method:",
            json: JSON.stringify(results)
        });
    }
}

/**
 * Render page with our form for the example
 * @param {Object} req Request obj
 * @param {Object} res Response obj
 */
eg004ListClickwraps.getController = async (req, res) => {
    // Check that the authentication token is okay with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate,
    // since they have not yet entered any information into the form

    const tokenOK = req.dsAuth.checkToken();
    if (tokenOK){
        sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
        res.render("pages/click-examples/eg004ListClickwraps", {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Getting a list of clickwraps",
            sourceFile: sourceFile,
            sourceUrl: dsConfig.githubExampleUrl + 'click/examples/' + sourceFile,
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation
        });
    } else {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
}
