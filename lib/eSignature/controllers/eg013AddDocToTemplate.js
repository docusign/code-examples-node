/**
 * @file
 * Example 013: Use embedded signing from a template with an added document
 * @author DocuSign
 */

const path = require('path')
    , validator = require('validator')
    , dsConfig = require('../../../config/index.js').config
    ;

const eg013AddDocToTemplate = exports
    , eg = 'eg013' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    , signerClientId = 1000 // The id of the signer within this application.
    , dsReturnUrl = dsConfig.appUrl + '/ds-return'
    , dsPingUrl = dsConfig.appUrl + '/' // Url that will be pinged by the DocuSign signing via Ajax
    ;

/**
 * Add doc to template
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg013AddDocToTemplate.createController = async (req, res) => {
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

    if (!req.session.templateId) {
        res.render('pages/examples/eg013AddDocToTemplate', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Use embedded signing from template and extra doc",
            templateOk: req.session.templateId,
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubExampleUrl + 'eSignature/' + path.basename(__filename),
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation
        });
    }

    // Step 2. Call the worker method
    let body = req.body
        // Additional data validation might also be appropriate
      , signerEmail = validator.escape(body.signerEmail)
      , signerName = validator.escape(body.signerName)
      , ccEmail = validator.escape(body.ccEmail)
      , ccName = validator.escape(body.ccName)
      , item = validator.escape(body.item)
      , quantity = validator.isInt(body.quantity) && body.quantity

      , envelopeArgs = {
            templateId: req.session.templateId,
            signerEmail: signerEmail,
            signerName: signerName,
            signerClientId: signerClientId,
            ccEmail: ccEmail,
            ccName: ccName,
            item: item,
            quantity: quantity,
            dsReturnUrl: dsReturnUrl,
            dsPingUrl: dsPingUrl
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
        results = await addDocToTemplate.addToTemplate (args)
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
eg013AddDocToTemplate.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        res.render('pages/examples/eg013AddDocToTemplate', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Use embedded signing from template and extra doc",
            templateOk: req.session.templateId,
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
