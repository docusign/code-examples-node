/**
 * @file
 * Example 014: Remote signer, cc, envelope has an order form
 * @author DocuSign
 */

const path = require('path')
    , collectPayment = require('../examples/collectPayment')
    , validator = require('validator')
    , dsConfig = require('../../../config/index.js').config
    ;

const eg014CollectPayment = exports
    , eg = 'eg014' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    , demoDocsPath = path.resolve(__dirname, '../../demo_documents')
    , docFile = 'order_form.html'
    ;


/**
 * Create the envelope
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg014CollectPayment.createController = async (req, res) => {
    // Step 1. Check the token
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user.
    let tokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (! tokenOK) {
        req.flash('info', 'Sorry, you need to re-authenticate.');
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }

    // Step 2. Call the worker method
    let body = req.body
        // Additional data validation might also be appropriate
      , signerEmail = validator.escape(body.signerEmail)
      , signerName = validator.escape(body.signerName)
      , ccEmail = validator.escape(body.ccEmail)
      , ccName = validator.escape(body.ccName)
      , envelopeArgs = {
            signerEmail: signerEmail,
            signerName: signerName,
            ccEmail: ccEmail,
            ccName: ccName,
            status: "sent",
            gatewayAccountId: dsConfig.gatewayAccountId,
            gatewayName: dsConfig.gatewayName,
            gatewayDisplayName: dsConfig.gatewayDisplayName,
            docFile: path.resolve(demoDocsPath, docFile)
        }
      , args = {
            accessToken: req.user.accessToken,
            basePath: req.session.basePath,
            accountId: req.session.accountId,
            envelopeArgs: envelopeArgs
        }
      , results = null
      ;

    try {
        results = await collectPayment.createEnvelopeWithPayment (args)
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
        req.session.envelopeId = results.envelopeId; // Save for use by other examples
            // which need an envelopeId
        res.render('pages/example_done', {
            title: "Envelope sent",
            h1: "Envelope sent",
            message: `The envelope has been created and sent!<br/>Envelope ID ${results.envelopeId}.`
        });
    }
}

/**
 * Form page for this application
 */
eg014CollectPayment.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        res.render('pages/examples/eg014CollectPayment', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Order form with payment by email",
            gatewayOk: dsConfig.gatewayAccountId && dsConfig.gatewayAccountId.length > 25,
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
