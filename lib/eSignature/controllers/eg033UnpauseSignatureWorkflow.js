/**
 * @file
 * Example 33: Unpause a signature workflow
 * @author DocuSign
 */

const path = require("path");
const { unpauseSignatureWorkflow } = require("../examples/unpauseSignatureWorkflow");
const { getExampleByNumber } = require("../../manifestService");
const dsConfig = require("../../../config/index.js").config;
const { formatString, API_TYPES, isCFR } = require('../../utils.js');

const eg033UnpauseSignatureWorkflow = exports;
const exampleNumber = 33;
const eg = `eg0${exampleNumber}`; // This example reference.
const api = API_TYPES.ESIGNATURE;
const mustAuthenticate = "/ds/mustAuthenticate";
const minimumBufferMin = 3;

/**
 * Create envelope with paused signature workflow
 * @param {Object} req Request obj
 * @param {Object} res Response obj
 */
eg033UnpauseSignatureWorkflow.createController = async (req, res) => {
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
    let results;

    // Step 2. Get required arguments
    const args = {
        accessToken: req.user.accessToken,
        basePath: req.session.basePath,
        accountId: req.session.accountId,
        envelopeId: req.session.pausedEnvelopeId,
    };

    // Step 3. Call the worker method
    try {
        results = await unpauseSignatureWorkflow(args);
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
        const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
        res.render("pages/example_done", {
            title: example.ExampleName,
            envelopeOk: true,
            message: formatString(example.ResultsPageText, results.envelopeId)
        });
    }
}


/**
 * Render page with our form for the example
 * @param {Object} req Request obj
 * @param {Object} res Response obj
 */
eg033UnpauseSignatureWorkflow.getController = async (req, res) => {
    // Check that the authentication token is okay with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate,
    // since they have not yet entered any information into the form
    const isTokenOK = req.dsAuth.checkToken();
    if (!isTokenOK) {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        return res.redirect(mustAuthenticate);
    }

    let enableCFR = await isCFR(req.user.accessToken, req.session.accountId, req.session.basePath);
    if (enableCFR == "enabled"){
        res.locals.statusCFR = "enabled";
    }

    const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
    const sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
    if (res.locals.statusCFR == "enabled") {
        res.render('pages/invalid_with_cfr', {
            title: "Not CFR Part 11 compatible"
        });
    } else {
        res.render("pages/examples/eg033UnpauseSignatureWorkflow", {
            eg: eg, csrfToken: req.csrfToken(),
            example: example,
            envelopeOk: req.session.hasOwnProperty("pausedEnvelopeId"),
            sourceFile: sourceFile,
            sourceUrl: dsConfig.githubExampleUrl + 'eSignature/examples/' + sourceFile,
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation
        });
    }
}
