/**
 * @file
 * Example 017: Set template tab (field) values and an envelope custom field value
 * @author DocuSign
 */

const path = require('path');
const { setTemplateTabValues } = require('../examples/setTemplateTabValues');
const validator = require('validator');
const dsConfig = require('../../../config/index.js').config;

const eg017SetTemplateTabValues = exports;
const eg = 'eg017'; // This example reference.
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;

/**
 * Send envelope with a template
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg017SetTemplateTabValues.createController = async (req, res) => {
    // Step 1. Check the token
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user.
    const tokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (! tokenOK) {
        req.flash('info', 'Sorry, you need to re-authenticate.');
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }

    if (!req.session.templateId) {
        res.render('pages/examples/eg017SetTemplateTabValues', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Send envelope using a template",
            templateOk: req.session.templateId,
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubExampleUrl + 'eSignature/' + path.basename(__filename),
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation
        });
    }

    // Step 2. Call the worker method
    const { body } = req;
        // Additional data validation might also be appropriate
    const envelopeArgs  = {
        templateId: req.session.templateId,
        signerEmail: validator.escape(body.signerEmail),
        signerName: validator.escape(body.signerName),
        signerClientId: 1000,
        ccEmail: validator.escape(body.ccEmail),
        ccName: validator.escape(body.ccName),
        dsReturnUrl: dsConfig.appUrl + '/ds-return'
    };
    const args = {
        accessToken: req.user.accessToken,
        basePath: req.session.basePath,
        accountId: req.session.accountId,
        envelopeArgs: envelopeArgs
    };
    let results = null;

    try {
        results = await setTemplateTabValues(args);
    }
    catch (error) {
        const errorBody = error && error.response && error.response.body;
        // we can pull the DocuSign error code and message from the response body
        const errorCode = errorBody && errorBody.errorCode;
        const errorMessage = errorBody && errorBody.message;
        // In production, may want to provide customized error messages and
        // remediation advice to the user.
        res.render('pages/error', {err: error, errorCode, errorMessage});
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
eg017SetTemplateTabValues.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    const tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
        res.render('pages/examples/eg017SetTemplateTabValues', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Set template tab values",
            templateOk: req.session.templateId,
            sourceFile: sourceFile,
            sourceUrl: dsConfig.githubExampleUrl + 'eSignature/examples/' + sourceFile,
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation
        });
    } else {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
}
