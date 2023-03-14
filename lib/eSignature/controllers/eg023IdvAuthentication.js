/**
 * @file
 * Example 023: ID Verification authentication
 * @author DocuSign
 */

const path = require('path');
const { idvAuthentication } = require('../examples/idvAuthentication');
const validator = require('validator');
const { getExampleByNumber } = require("../../manifestService");
const dsConfig = require('../../../config/index.js').config;
const { formatString, API_TYPES } = require('../../utils.js');

const eg023IdvAuthentication = exports;
const exampleNumber = 23;
const eg = `eg0${exampleNumber}`; // This example reference.
const api = API_TYPES.ESIGNATURE;
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;
const demoDocsPath = path.resolve(__dirname, '../../../demo_documents');
const pdf1File = 'World_Wide_Corp_lorem.pdf';

/**
 * Create the envelope
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg023IdvAuthentication.createController = async (req, res) => {
    // Step 1: Obtain your OAuth token
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user.
    const isTokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (!isTokenOK) {
        req.flash('info', 'Sorry, you need to re-authenticate.');
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        return res.redirect(mustAuthenticate);
    }

	const { body } = req;
    // Additional data validation might also be appropriate
    const envelopeArgs  = {
        signerEmail: validator.escape(body.signerEmail), // represents your {SIGNER_EMAIL}
        signerName: validator.escape(body.signerName),    // represents your {SIGNER_NAME}
        docFile: path.resolve(demoDocsPath, pdf1File)
    };
    const args = {
        accessToken: req.user.accessToken,  // represents your {ACCESS_TOKEN}
        basePath: req.session.basePath,
        accountId: req.session.accountId,   // represents your {ACCOUNT_ID}
        envelopeArgs: envelopeArgs
    };
    let results = null;
    const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);

    try {
        // Step 2: Call the api method
        results = await idvAuthentication(args);
        console.log("WorkflowId: " + results.workflowId);
    } catch (error) {
        if (error.message.includes("IDENTITY_WORKFLOW_INVALID_ID")) {
            const errorCode = error.message;
            const errorMessage = "The identity workflow ID specified is not valid.";
            const errorInfo = example.CustomErrorTexts[0].ErrorMessage;
            res.render("pages/error", {err: error, errorCode, errorMessage, errorInfo});
        } else {
            const errorBody = error && error.response && error.response.body;
            // We can pull the DocuSign error code and message from the response body
            const errorCode = errorBody && errorBody.errorCode;
            const errorMessage = errorBody && errorBody.message;

            // In production, may want to provide customized error messages and
            // remediation advice to the user.
            res.render('pages/error', {err: error, errorCode, errorMessage});
        }
    }

    if (results) {
        req.session.envelopeId = results.envelopeId; 	// Save for use by other examples
	    												// which need an envelopeId
        res.render('pages/example_done', {
            title: example.ExampleName,
            message: formatString(example.ResultsPageText, results.envelopeId)
        });
    }
}



// ***DS.snippet.0.end

/**
 * Form page for this application
 */
eg023IdvAuthentication.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    const isTokenOK = req.dsAuth.checkToken();
    if (!isTokenOK) {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        return res.redirect(mustAuthenticate);
    }

    const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
    const sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
    res.render('pages/examples/eg023IdvAuthentication', {
        eg: eg, csrfToken: req.csrfToken(),
        example: example,
        sourceFile: sourceFile,
        sourceUrl: dsConfig.githubExampleUrl + 'eSignature/examples/' + sourceFile,
        documentation: dsConfig.documentation + eg,
        showDoc: dsConfig.documentation
    });
}
