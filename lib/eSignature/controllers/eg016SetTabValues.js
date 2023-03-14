/**
 * @file
 * Example 016: Set optional and locked field values and an envelope custom field value
 * @author DocuSign
 */

const path = require('path');
const { setTabValues } = require('../examples/setTabValues');
const validator = require('validator');
const { getExampleByNumber } = require("../../manifestService");
const dsConfig = require('../../../config/index.js').config;
const { API_TYPES } = require('../../utils.js');

const eg016SetTabValues = exports;
const exampleNumber = 16;
const eg = `eg0${exampleNumber}`; // This example reference.
const api = API_TYPES.ESIGNATURE;
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;
const signerClientId = 1000; // The id of the signer within this application.
const dsReturnUrl = dsConfig.appUrl + '/ds-return';
const demoDocsPath = path.resolve(__dirname, '../../../demo_documents');
const docName = 'World_Wide_Corp_salary.docx';

/**
 * Set tab values
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg016SetTabValues.createController = async (req, res) => {
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
    const envelopeArgs  = {
        signerEmail: validator.escape(body.signerEmail),
        signerName: validator.escape(body.signerName),
        signerClientId: signerClientId,
        dsReturnUrl: dsReturnUrl,
        docFile: path.resolve(demoDocsPath, docName)
    };
    const args = {
        accessToken: req.user.accessToken,
        basePath: req.session.basePath,
        accountId: req.session.accountId,
        envelopeArgs: envelopeArgs
    };
    let results = null;

    try {
        results = await setTabValues(args);
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
    const isTokenOK = req.dsAuth.checkToken();
    if (!isTokenOK) {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        return res.redirect(mustAuthenticate);
    }

    const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
    const sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
    res.render('pages/examples/eg016SetTabValues', {
        eg: eg, csrfToken: req.csrfToken(),
        example: example,
        sourceFile: sourceFile,
        sourceUrl: dsConfig.githubExampleUrl + 'eSignature/examples/' + sourceFile,
        documentation: dsConfig.documentation + eg,
        showDoc: dsConfig.documentation
    });
}
