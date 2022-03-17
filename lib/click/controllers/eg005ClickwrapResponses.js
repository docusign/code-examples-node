/**
 * @file
 * Example 5: Get clickwrap responses
 * @author DocuSign
 */

const path = require("path");
const dsConfig = require("../../../config/index.js").config;
const { getClickwrapAgreements } = require("../examples/clickwrapResponses");
const { getClickwraps } = require("../examples/listClickwraps");
const validator = require("validator");

const eg005ClickwrapResponses = exports;
const eg = "eg005";
const mustAuthenticate = "/ds/mustAuthenticate";
const minimumBufferMin = 3;

/**
 * Render page with our form for the example
 * @param {Object} req Request obj
 * @param {Object} res Response obj
 */
eg005ClickwrapResponses.createController = async (req, res) => {
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
    const { body, session, user } = req;
    const args = {
        accessToken: user.accessToken,
        basePath: dsConfig.clickAPIUrl,
        accountId: session.accountId,
        clickwrapId: body.clickwrapId,
    }

    // Call the worker method
    try {
        results = await getClickwrapAgreements(args);
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
            title: "Get clickwrap responses",
            h1: "Get clickwrap responses",
            message: "Results from the ClickWraps::getClickwrapAgreements method:",
            json: JSON.stringify(results)
        });
    }
}

/**
 * Render page with our form for the example
 * @param {Object} req Request obj
 * @param {Object} res Response obj
 */
eg005ClickwrapResponses.getController = async (req, res) => {
    // Check that the authentication token is okay with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate,
    // since they have not yet entered any information into the form

    const tokenOK = req.dsAuth.checkToken();
    if (tokenOK){
        const args = {
            accessToken: req.user.accessToken,
            basePath: dsConfig.clickAPIUrl,
            accountId: req.session.accountId,
        };
        sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
        res.render("pages/click-examples/eg005ClickwrapResponses", {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Getting clickwrap responses",
            clickwrapsData: await getClickwraps(args),
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
