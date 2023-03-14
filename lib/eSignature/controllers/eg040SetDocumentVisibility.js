/**
 * @file
 * Example 040: Set document visibility for envelope recipients
 * @author DocuSign
 */

const path = require('path');
const validator = require('validator');
const dsConfig = require('../../../config/index.js').config;
const { sendEnvelope } = require('../examples/setDocumentVisibility');
const { getExampleByNumber } = require("../../manifestService");
const { formatString, API_TYPES, isCFR } = require('../../utils.js');

const eg040SetDocumentVisibility = exports;
const exampleNumber = 40;
const eg = `eg0${exampleNumber}`; // This example reference.
const api = API_TYPES.ESIGNATURE;
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;
const demoDocsPath = path.resolve(__dirname, '../../../demo_documents');
const doc2File = 'World_Wide_Corp_Battle_Plan_Trafalgar.docx';
const doc3File = 'World_Wide_Corp_lorem.pdf';

/**
 * Create the envelope and set document visibility for envelope recipients
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg040SetDocumentVisibility.createController = async (req, res) => {
    // Step 1. Check the token
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user.
    const isTokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (!isTokenOK) {
        req.flash('info', 'Sorry, you need to re-authenticate.');
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        return res.redirect(mustAuthenticate);
    }

    // Step 2. Call the worker method
    const { body } = req;
    const envelopeArgs = {
        signer1Email: validator.escape(body.signer1Email),
        signer1Name: validator.escape(body.signer1Name),
        signer2Email: validator.escape(body.signer2Email),
        signer2Name: validator.escape(body.signer2Name),
        ccEmail: validator.escape(body.ccEmail),
        ccName: validator.escape(body.ccName),
        status: "sent",
        doc2File: path.resolve(demoDocsPath, doc2File),
        doc3File: path.resolve(demoDocsPath, doc3File)
    };
    const args = {
        accessToken: req.user.accessToken,
        basePath: req.session.basePath,
        accountId: req.session.accountId,
        envelopeArgs: envelopeArgs
    };
    let results = null;

    try {
        results = await sendEnvelope(args);
    } catch (error) {
        const errorBody = error && error.response && error.response.body;
        // we can pull the DocuSign error code and message from the response body
        const errorCode = errorBody && errorBody.errorCode;
        const errorMessage = errorBody && errorBody.message;

        let errorData = { err: error, errorCode, errorMessage }

        if (errorCode && errorCode === "ACCOUNT_LACKS_PERMISSIONS") {
            errorData.errorInfo = `<p>See <a href="https://developers.docusign.com/docs/esign-rest-api/how-to/set-document-visibility/">How to set document visibility for envelope recipients</a> in 
                the DocuSign Developer Center for instructions on how to 
                enable document visibility in your developer account.</p>`
        }
        // In production, may want to provide customized error messages and
        // remediation advice to the user.
        res.render('pages/error', errorData);
    }
    if (results) {
        const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
        res.render('pages/example_done', {
            title: example.ExampleName,
            message: formatString(example.ResultsPageText, results.envelopeId)
        });
    }
}

/**
 * Form page for this application
 */
eg040SetDocumentVisibility.getController = async (req, res) => {
    /**
     * Check that the authentication token is ok with a long buffer time.
     * If needed, now is the best time to ask the user to authenticate
     * since they have not yet entered any information into the form.
     */
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
        res.render('pages/examples/eg040SetDocumentVisibility', {
            eg: eg, csrfToken: req.csrfToken(),
            example: example,
            sourceFile: sourceFile,
            sourceUrl: dsConfig.githubExampleUrl + 'eSignature/examples/' + sourceFile,
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation
        });
    }
}
