/**
 * @file
 * Example 011: Use embedded sending: Remote signer, cc, envelope has three documents
 * @author DocuSign
 */

const path = require('path')
    , validator = require('validator')
    , dsConfig = require('../../../config/index.js').config
    , embeddedSending = require('../examples/embeddedSending') // used to create envelope
    ;

const eg011EmbeddedSending = exports
    , eg = 'eg011' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    , demoDocsPath = path.resolve(__dirname, '../../../demo_documents')
    , doc2File = 'World_Wide_Corp_Battle_Plan_Trafalgar.docx'
    , doc3File = 'World_Wide_Corp_lorem.pdf'
    , dsReturnUrl = dsConfig.appUrl + '/ds-return'
    ;

/**
 * Create the envelope
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg011EmbeddedSending.createController = async (req, res) => {
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
      , startingView = validator.escape(body.startingView)
      , envelopeArgs = {
            signerEmail: signerEmail,
            signerName: signerName,
            ccEmail: ccEmail,
            ccName: ccName,
            dsReturnUrl: dsReturnUrl,
            doc2File: path.resolve(demoDocsPath, doc2File),
            doc3File: path.resolve(demoDocsPath, doc3File)
        }
      , args = {
            accessToken: req.user.accessToken,
            basePath: req.session.basePath,
            accountId: req.session.accountId,
            startingView: startingView,
            envelopeArgs: envelopeArgs
        }
      , results = null
      ;

    try {
        results = await embeddedSending.sendEnvelopeUsingEmbeddedSending (args)
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
        // Redirect the user to the Sender View
        // Don't use an iFrame!
        // State can be stored/recovered using the framework's session or a
        // query parameter on the returnUrl (see the makeSenderViewRequest method)
        res.redirect(results.redirectUrl);
    }
}

/**
 * Form page for this application
 */
eg011EmbeddedSending.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        res.render('pages/examples/eg011EmbeddedSending', {
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
