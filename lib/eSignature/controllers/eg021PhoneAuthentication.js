/**
 * @file
 * Example 021: Phone-based recipient authentication
 * @author DocuSign
 */

const path = require('path')
    , phoneAuthentication = require('../examples/phoneAuthentication')
    , validator = require('validator')
    , dsConfig = require('../../../config/index.js').config
    ;

const eg021PhoneAuthentication = exports
    , eg = 'eg021' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    ;

/**
 * Create the envelope
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg021PhoneAuthentication.createController = async (req, res) => {
    // Step 1: Obtain your OAuth token
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user.
    let tokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (! tokenOK) {
        req.flash('info', 'Sorry, you need to re-authenticate.');
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }

	let body = req.body
        // Additional data validation might also be appropriate
      , signerEmail = validator.escape(body.signerEmail)
      , signerName = validator.escape(body.signerName)
      , phoneNumber = validator.escape(body.phoneNumber)
      , envelopeArgs = {
        signerEmail: signerEmail, // represents your {SIGNER_EMAIL}
        signerName: signerName,    // represents your {SIGNER_NAME}
        phoneNumber: phoneNumber
    }
  , args = {
        accessToken: req.user.accessToken,  // represents your {ACCESS_TOKEN}
        basePath: req.session.basePath,
        accountId: req.session.accountId,   // represents your {ACCOUNT_ID}
        envelopeArgs: envelopeArgs
    }
      , results = null
      ;

    try {
	    // Step 2: Send the envelope
        results = await phoneAuthentication.createEnvelope(args);
	}
    catch (error) {
        let errorBody = error && error.response && error.response.body
            // we can pull the DocuSign error code and message from the response body
          , errorCode = errorBody && errorBody.errorCode
          , errorMessage = errorBody && errorBody.message
          ;
        // In production, may want to provide customized error messages and
        // remediation advice to the user.
        res.render('pages/error', {err: error, errorCode: errorCode, errorMessage: errorMessage});
    }
        if (results) {
        req.session.envelopeId = results.envelopeId; 	// Save for use by other examples
														// which need an envelopeId
        res.render('pages/example_done', {
            title: "Envelope sent",
            h1: "Envelope sent",
            message: `The envelope has been created and sent!<br/>Envelope ID ${results.envelopeId}.`
        });
    }
}

// ***DS.snippet.0.end

/**
 * Form page for this application
 */
eg021PhoneAuthentication.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        res.render('pages/examples/eg021PhoneAuthentication', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Signing request by email",
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
