/**
 * @file
 * Example 1: Creating a clickwrap
 * @author DocuSign
 */

const path = require("path");
const { createClickwrap } = require("../examples/createClickwrap");
const validator = require("validator");
const { getExampleByNumber } = require("../../manifestService");
const dsConfig = require("../../../config/index.js").config;
const { API_TYPES } = require('../../utils.js');

const eg001CreateClickwrap = exports;
const exampleNumber = 1;
const eg = `ceg00${exampleNumber}`; // This example reference.
const api = API_TYPES.CLICK;
const mustAuthenticate = "/ds/mustAuthenticate";
const minimumBufferMin = 3;
const demoDocumentsPath = path.resolve(__dirname, "../../../demo_documents");

/**
 * Create clickwrap
 * @param {Object} req Request obj
 * @param {Object} res Response obj
 */
eg001CreateClickwrap.createController = async (req, res) => {
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
    const { body } = req;
    let results = null;

    const args = {
        accessToken: req.user.accessToken,
        basePath: dsConfig.clickAPIUrl,
        accountId: req.session.accountId,
        clickwrapName: validator.escape(body.clickwrapName),
        docFile: path.resolve(demoDocumentsPath, dsConfig.docTermsPdf)
    };

    // Call the worker method
    try {
        results = await createClickwrap(args);
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
        req.session.clickwrapId = results.clickwrapId;
        req.session.clickwrapName = results.clickwrapName;
        const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
        res.render("pages/example_done", {
            title: example.ExampleName,
            message: formatString(example.ResultsPageText, results.clickwrapName),
            json: JSON.stringify(results)
        });
    }
}

/**
 * Render page with our form for the example
 * @param {Object} req Request obj
 * @param {Object} res Response obj
 */
eg001CreateClickwrap.getController = async (req, res) => {
    // Check that the authentication token is okay with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate,
    // since they have not yet entered any information into the form
    const isTokenOK = req.dsAuth.checkToken();
    if (!isTokenOK) {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        return res.redirect(mustAuthenticate);
    }

    const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
    const sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
    res.render("pages/click-examples/eg001CreateClickwrap", {
        eg: eg, csrfToken: req.csrfToken(),
        example: example,
        sourceFile: sourceFile,
        sourceUrl: dsConfig.githubExampleUrl + 'click/examples/' + sourceFile,
        documentation: dsConfig.documentation + eg,
        showDoc: dsConfig.documentation
    });
}
