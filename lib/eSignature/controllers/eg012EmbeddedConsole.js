/**
 * @file
 * Example 012: Embedded NDSE (console)
 * @author DocuSign
 */

const path = require('path');
const validator = require('validator');
const { createEmbeddedConsoleView } = require('../examples/embeddedConsole');
const { getExampleByNumber } = require("../../manifestService");
const dsConfig = require('../../../config/index.js').config;
const { API_TYPES } = require('../../utils.js');

const eg012EmbeddedConsole = exports;
const exampleNumber = 12;
const eg = `eg0${exampleNumber}`; // This example reference.
const api = API_TYPES.ESIGNATURE;
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
    const isTokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (!isTokenOK) {
        req.flash('info', 'Sorry, you need to re-authenticate.');
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        return res.redirect(mustAuthenticate);
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
    } catch (error) {
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
    const isTokenOK = req.dsAuth.checkToken();
    if (!isTokenOK) {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        return res.redirect(mustAuthenticate);
    }

    const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
    const sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
    res.render('pages/examples/eg012EmbeddedConsole', {
        eg: eg, csrfToken: req.csrfToken(),
        example: example,
        envelopeOk: req.session.envelopeId,
        sourceFile: sourceFile,
        sourceUrl: dsConfig.githubExampleUrl + 'eSignature/examples/' + sourceFile,
        documentation: dsConfig.documentation + eg,
        showDoc: dsConfig.documentation
    });
}
