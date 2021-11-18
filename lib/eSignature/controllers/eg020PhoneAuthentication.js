/**
 * @file
 * Example 020: Phone authentication
 * @author DocuSign
 */

const path = require('path');
const { phoneAuthentication } = require('../examples/phoneAuthentication');
const validator = require('validator');
const dsConfig = require('../../../config/index.js').config;

const eg020PhoneAuthentication = exports;
const eg = 'eg020'; // This example reference.
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
    const tokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (! tokenOK) {
        req.flash('info', 'Sorry, you need to re-authenticate.');
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
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

    try {
        // Step 2: Call the api method
        results = await phoneAuthentication(args);
        console.log("WorkflowId: " + results.workflowId);
    }
    catch (error) {
        if (error.message.includes("IDENTITY_WORKFLOW_INVALID_ID")) {
            const errorCode = error.message;
            const errorMessage = "The identity workflow ID specified is not valid.";
            const errorInfo = "Please contact <a target='_blank' href='https://support.docusign.com'>Support</a> to enable Phone Authentication in your account."
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
            title: "Require Phone Authentication for a Recipient",
            h1: "Require Phone Authentication for a Recipient",
            message: `The envelope has been created and sent!<br/>Envelope ID ${results.envelopeId}.`
        });
    }
}



// ***DS.snippet.0.end

/**
 * Form page for this application
 */
eg020PhoneAuthentication.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    const tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        res.render('pages/examples/eg020PhoneAuthentication', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Require Phone Authentication for a Recipient",
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubExampleUrl + 'eSignature/' + path.basename(__filename),
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation
        });
    } else {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
}