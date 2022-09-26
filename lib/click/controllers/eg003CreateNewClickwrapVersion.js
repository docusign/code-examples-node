/**
 * @file
 * Example 3: Create a new clickwrap version
 * @author DocuSign
 */

const path = require("path");
const { getClickwraps } = require("../examples/listClickwraps");
const { createNewClickwrapVersion } = require("../examples/createNewClickwrapVersion");
const { getExampleByNumber } = require("../../manifestService");
const dsConfig = require("../../../config/index.js").config;
const { formatString } = require('../../utils.js');

const eg003CreateNewClickwrapVersion = exports;
const exampleNumber = 3;
const eg = `eg00${exampleNumber}`; // This example reference.
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
    const isTokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (!isTokenOK) {
        req.flash("info", "Sorry, you need to re-authenticate.");
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        return res.redirect(mustAuthenticate);
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
    } catch (error) {
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
        const example = getExampleByNumber(res.locals.manifest, exampleNumber);
        res.render("pages/example_done", {
            title: example.ExampleName,
            message: formatString(example.ResultsPageText, results.versionNumber, results.clickwrapName),
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

    const isTokenOK = req.dsAuth.checkToken();
    if (!isTokenOK) {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        return res.redirect(mustAuthenticate);
    }

    const args = {
        accessToken: req.user.accessToken,
        basePath: dsConfig.clickAPIUrl,
        accountId: req.session.accountId,
    };

    const example = getExampleByNumber(res.locals.manifest, exampleNumber);
    const sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
    res.render("pages/click-examples/eg003CreateNewClickwrapVersion", {
        eg: eg, csrfToken: req.csrfToken(),
        example: example,
        clickwrapsData: await getClickwraps(args),
        sourceFile: sourceFile,
        sourceUrl: dsConfig.githubExampleUrl + 'click/examples/' + sourceFile,
        documentation: dsConfig.documentation + eg,
        showDoc: dsConfig.documentation
    });
}
