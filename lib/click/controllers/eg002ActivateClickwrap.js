/**
 * @file
 * Example 2: Activating a clickwrap
 * @author DocuSign
 */

const path = require("path");
const { activateClickwrap, getInactiveClickwraps } = require("../examples/activateClickwrap");
const dsConfig = require("../../../config/index.js").config;

const eg002ActivateClickwrap = exports;
const eg = "eg002";
const mustAuthenticate = "/ds/mustAuthenticate";
const minimumBufferMin = 3;

/**
 * Activate clickwrap
 * @param {Object} req Request obj
 * @param {Object} res Response obj
 */
eg002ActivateClickwrap.createController = async (req, res) => {
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
    const clickwrap = JSON.parse(req.body.clickwrap);

    const args = {
        accessToken: req.user.accessToken,
        basePath: dsConfig.clickAPIUrl,
        accountId: req.session.accountId,
        clickwrapId: clickwrap.clickwrapId,
        clickwrapVersionNumber: clickwrap.versionNumber,
    };

    // Call the worker method
    try {
        results = await activateClickwrap(args);
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
        req.session.clickIsActive = true;
        res.render("pages/example_done", {
            title: "Activate a clickwrap",
            h1: "Activate a clickwrap",
            message: `The clickwrap ${results.clickwrapName} has been activated.`,
            json: JSON.stringify(results)
        });
    }
}

/**
 * Render page with our form for the example
 * @param {Object} req Request obj
 * @param {Object} res Response obj
 */
eg002ActivateClickwrap.getController = async (req, res) => {
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
        res.render("pages/click-examples/eg002ActivateClickwrap", {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Activate a clickwrap",
            clickwrapsData: await getInactiveClickwraps(args),
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
