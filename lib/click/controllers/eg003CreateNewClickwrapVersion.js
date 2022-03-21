/**
 * @file
 * Example 3: Create a new clickwrap version
 * @author DocuSign
 */

const path = require("path");
const { getClickwraps } = require("../examples/listClickwraps");
const { createNewClickwrapVersion } = require("../examples/createNewClickwrapVersion");
const dsConfig = require("../../../config/index.js").config;

const eg003CreateNewClickwrapVersion = exports;
const eg = "eg003";
const mustAuthenticate = "/ds/mustAuthenticate";
const minimumBufferMin = 3;
const demoDocumentsPath = path.resolve(__dirname, "../../../demo_documents");

/**
 * Render page with our form for the example
 * @param {Object} req Request obj
 * @param {Object} res Response obj
 */
eg003CreateNewClickwrapVersion.createController = async (req, res) => {
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
        clickwrapName: req.body.clickwrapName,
        clickwrapId: req.body.clickwrapId,
        docFile: path.resolve(demoDocumentsPath, dsConfig.docTermsPdf)
    };

    // Call the worker method
    try {
        results = await createNewClickwrapVersion(args);
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
            title: "Create a new clickwrap version",
            h1: "Create a new clickwrap version",
            message: `Version ${results.versionNumber} of clickwrap ${results.clickwrapName} has been created.`,
            json: JSON.stringify(results)
        });
    }
}

/**
 * Render page with our form for the example
 * @param {Object} req Request obj
 * @param {Object} res Response obj
 */
eg003CreateNewClickwrapVersion.getController = async (req, res) => {
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
        res.render("pages/click-examples/eg003CreateNewClickwrapVersion", {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Creating a new clickwrap version",
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
