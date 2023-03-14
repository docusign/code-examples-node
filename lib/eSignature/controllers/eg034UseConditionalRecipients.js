/**
 * @file
 * Example 34: Use conditional recipients
 * @author DocuSign
 */

const path = require("path");
const { useConditionalRecipients } = require("../examples/useConditionalRecipients");
const validator = require("validator");
const { getExampleByNumber } = require("../../manifestService");
const dsConfig = require("../../../config/index.js").config;
const { formatString, API_TYPES, isCFR } = require('../../utils.js');

const eg034UseConditionalRecipients = exports;
const exampleNumber = 34;
const eg = `eg0${exampleNumber}`; // This example reference.
const api = API_TYPES.ESIGNATURE;
const mustAuthenticate = "/ds/mustAuthenticate";
const minimumBufferMin = 3;
const demoDocumentsPath = path.resolve(__dirname, "../../../demo_documents");

/**
 * Create envelope with paused signature workflow
 * @param {Object} req Request obj
 * @param {Object} res Response obj
 */
eg034UseConditionalRecipients.createController = async (req, res) => {
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

    // Step 2. Get required arguments
    const { body } = req;
    let results = null;
    const envelopeArgs = {
        signer1Email: validator.escape(body.signer1Email),
        signer1Name: validator.escape(body.signer1Name),
        signer2aEmail: validator.escape(body.signer2aEmail),
        signer2aName: validator.escape(body.signer2aName),
        signer2bEmail: validator.escape(body.signer2bEmail),
        signer2bName: validator.escape(body.signer2bName),
        status: "Sent",
        docFile: path.resolve(demoDocumentsPath, dsConfig.docTxt)
    };
    const args = {
        accessToken: req.user.accessToken,
        basePath: req.session.basePath,
        accountId: req.session.accountId,
        envelopeArgs
    };
    const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);

    // Step 3. Call the worker method
    try {
        results = await useConditionalRecipients(args);
    } catch (error) {
        const errorBody = error && error.response && error.response.body;
        // We can pull the DocuSign error code and message from the response body
        const errorCode = errorBody && errorBody.errorCode;
        const errorMessage = errorBody && errorBody.message;
        const errorInfo = "";
        // In production, you may want to provide customized error messages and
        // remediation advice to the user
        if(errorCode.includes("WORKFLOW_UPDATE_RECIPIENTROUTING_NOT_ALLOWED")){
            errorMessage = "Update to the workflow with recipient routing is not allowed for your account!";
            errorInfo = example.CustomErrorTexts[0].ErrorMessage;
        }
        res.render("pages/error_eg34", { err: error, errorCode, errorMessage, errorInfo });
    }

    if (results) {
        // Save for use by other examples that need an envelopeId
        req.session.pausedEnvelopeId = results.envelopeId;
        res.render("pages/example_done", {
            title: example.ExampleName,
            message: formatString(example.ResultsPageText, results.envelopeId)
        });
    }
}

/**
 * Render page with our form for the example
 * @param {Object} req Request obj
 * @param {Object} res Response obj
 */
eg034UseConditionalRecipients.getController = async (req, res) => {
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
        res.render("pages/examples/eg034UseConditionalRecipients", {
            eg: eg, csrfToken: req.csrfToken(),
            example: example,
            sourceFile: sourceFile,
            sourceUrl: dsConfig.githubExampleUrl + 'eSignature/examples/' + sourceFile,
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation
        });
    }
}
