/**
 * @file
 * Example 038: Signable HTML document
 * @author DocuSign
 */

const path = require('path');
const validator = require('validator');
const dsConfig = require('../../../config/index.js').config;
const { sendEnvelope } = require('../examples/responsiveSigning');

const eg038ResponsiveSigning = exports;
const eg = 'eg038'; // This example reference.
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;
const demoDocsPath = path.resolve(__dirname, '../../../demo_documents');
const docFile = 'order_form.html';
const dsReturnUrl = dsConfig.appUrl + '/ds-return';
const dsPingUrl = dsConfig.appUrl + '/'; // Url that will be pinged by the DocuSign signing via Ajax

/**
 * Create the envelope
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
 eg038ResponsiveSigning.createController = async (req, res) => {
    // Step 1. Check the token
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user.
    const isTokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (! isTokenOK) {
        req.flash('info', 'Sorry, you need to re-authenticate.');
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }

    // Step 2. Call the worker method
    const { body } = req;
    const envelopeArgs = {
        signerEmail: validator.escape(body.signerEmail),
        signerName: validator.escape(body.signerName),
        ccEmail: validator.escape(body.ccEmail),
        ccName: validator.escape(body.ccName),
        status: 'sent',
        signerClientId: 1000,
        docFile: path.resolve(demoDocsPath, docFile),
        dsReturnUrl: dsReturnUrl,
        dsPingUrl: dsPingUrl
    };
    const args = {
        accessToken: req.user.accessToken,
        basePath: req.session.basePath,
        accountId: req.session.accountId,
        envelopeArgs: envelopeArgs
    };
    let results = null;

    try {
        results = await sendEnvelope(args);
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
        res.redirect(results.redirectUrl);
    }
}

/**
* Form page for this application
*/
eg038ResponsiveSigning.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    const isTokenOK = req.dsAuth.checkToken();
    if (isTokenOK) {
        sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
        res.render('pages/examples/eg038ResponsiveSigning', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Signable HTML document",
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
