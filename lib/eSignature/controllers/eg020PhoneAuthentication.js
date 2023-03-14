/**
 * @file
 * Example 020: Phone authentication
 * @author DocuSign
 */

const path = require('path');
const { phoneAuthentication } = require('../examples/phoneAuthentication');
const validator = require('validator');
const { getExampleByNumber } = require("../../manifestService");
const dsConfig = require('../../../config/index.js').config;
const { formatString, API_TYPES, isCFR } = require('../../utils.js');

const eg020PhoneAuthentication = exports;
const exampleNumber = 20;
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
eg020PhoneAuthentication.createController = async (req, res) => {
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
        phoneNumber: validator.escape(body.phoneNumber),   // represents your phone number
        countryCode: validator.escape(body.countryCode),   // represents your country code
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
        results = await phoneAuthentication(args);
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
eg020PhoneAuthentication.getController = async (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
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
    if (res.locals.statusCFR == "enabled") {
        res.render('pages/invalid_with_cfr', {
            title: "Not CFR Part 11 compatible"
        });
    } else {
        res.render('pages/examples/eg020PhoneAuthentication', {
            eg: eg, csrfToken: req.csrfToken(),
            example: example,
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubExampleUrl + 'eSignature/' + path.basename(__filename),
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation
        });
    }
}