/**
 * @file
 * Example 016: Set optional and locked field values and an envelope custom field value
 * @author DocuSign
 */

const path = require('path')
    , setTabValues = require('../examples/setTabValues')
    , validator = require('validator')
    , dsConfig = require('../../../config/index.js').config
    ;

const eg016SetTabValues = exports
    , eg = 'eg016' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    , signerClientId = 1000 // The id of the signer within this application.
    , dsReturnUrl = dsConfig.appUrl + '/ds-return'
    , demoDocsPath = path.resolve(__dirname, '../../../demo_documents')
    , docName = 'World_Wide_Corp_salary.docx'
    ;

/**
 * Set tab values
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg016SetTabValues.createController = async (req, res) => {
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
      , envelopeArgs = {
            signerEmail: signerEmail,
            signerName: signerName,
            signerClientId: signerClientId,
            dsReturnUrl: dsReturnUrl,
            docFile: path.resolve(demoDocsPath, docName)
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
        results = await setTabValues.setValues (args)
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
        // Redirect the user to the embedded signing 
        // Don't use an iFrame!
        // State can be stored/recovered using the framework's session or a
        // query parameter on the returnUrl (see the makeRecipientViewRequest method)
        res.redirect(results.redirectUrl);
    }
}

/**
 * Form page for this application
 */
eg016SetTabValues.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        res.render('pages/examples/eg016SetTabValues', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Use embedded signing",
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
