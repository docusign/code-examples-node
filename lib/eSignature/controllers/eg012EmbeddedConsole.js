/**
 * @file
 * Example 012: Embedded NDSE (console)
 * @author DocuSign
 */

const path = require('path');
const validator = require('validator');
const { createEmbeddedConsoleView } = require('../examples/embeddedConsole');
const dsConfig = require('../../../config/index.js').config;

const eg012EmbeddedConsole = exports;
const eg = 'eg012'; // This example reference.
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;
const dsReturnUrl = dsConfig.appUrl + '/ds-return';

/**
 * The controller
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg012EmbeddedConsole.createController = async (req, res) => {
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

    // Step 2. Call the worker method
    const { body } = req;
      // Additional data validation might also be appropriate
    const args = {
        accessToken: req.user.accessToken,
        basePath: req.session.basePath,
        accountId: req.session.accountId,
        dsReturnUrl: dsReturnUrl,
        startingView: validator.escape(body.startingView),
        envelopeId: req.session.envelopeId // may be undefined
    };
    let results = null;

    try {
        results = await createEmbeddedConsoleView(args);
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
        // Redirect the user to the NDSE View
        // Don't use an iFrame!
        // State can be stored/recovered using the framework's session or a
        // query parameter on the returnUrl (see the makeSenderViewRequest method)
        res.redirect(results.redirectUrl);
    }
}

/**
 * Form page for this application
 */
eg012EmbeddedConsole.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    const tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
        res.render('pages/examples/eg012EmbeddedConsole', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Embedded DocuSign web tool",
            envelopeOk: req.session.envelopeId,
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
