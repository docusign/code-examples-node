/**
 * @file
 * Example 039: Send an envelope to an In Person Signer
 * @author DocuSign
 */

const path = require('path');
const { sendEnvelopeForInPersonSigning } = require('../examples/signingInPerson');
const validator = require('validator');
const dsConfig = require('../../../config/index.js').config;
const { getUserInfo } = require('../getData');
const { getExampleByNumber } = require("../../manifestService");
const { API_TYPES, isCFR } = require('../../utils.js');

const eg039SigningInPerson = exports;
const exampleNumber = 39;
const eg = `eg0${exampleNumber}`; // This example reference.
const api = API_TYPES.ESIGNATURE;
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;
const demoDocsPath = path.resolve(__dirname, '../../../demo_documents');
const pdf1File = 'World_Wide_Corp_lorem.pdf';
const dsReturnUrl = dsConfig.appUrl + '/ds-return';
const dsPingUrl = dsConfig.appUrl + '/'; // Url that will be pinged by the DocuSign signing via Ajax

/**
 * Create the envelope, the embedded signing, and then redirect to the DocuSign signing
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg039SigningInPerson.createController = async (req, res) => {
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

    // Step 2. Get the email and name of the current user
    const user = await getUserInfo(req.user.accessToken, req.session.basePath);
    const email = user.email;
    const hostName = user.name;

    // Step 3. Call the worker method
    const { body } = req;
    const envelopeArgs = {
        hostEmail: email,
        hostName: hostName,
        signerName: validator.escape(body.signerName),
        dsReturnUrl: dsReturnUrl,
        dsPingUrl: dsPingUrl,
        docFile: path.resolve(demoDocsPath, pdf1File)
    };
    const args = {
        accessToken: req.user.accessToken,
        basePath: req.session.basePath,
        accountId: req.session.accountId,
        envelopeArgs: envelopeArgs
    };
    let results = null;

    try {
        results = await sendEnvelopeForInPersonSigning(args);
    } catch (error) {
        const errorBody = error && error.response && error.response.body;
        // we can pull the DocuSign error code and message from the response body
        const errorCode = error && error.status || errorBody && errorBody.errorCode;
        const errorMessage = errorBody && errorBody.error_description || errorBody.message;
        // In production, may want to provide customized error messages and
        // remediation advice to the user.
        res.render('pages/error', {err: error, errorCode, errorMessage});
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
eg039SigningInPerson.getController = async (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    const isTokenOK = req.dsAuth.checkToken();
    if (!isTokenOK) {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        return res.redirect(mustAuthenticate);
    }

    let enableCFR = await isCFR(req.user.accessToken, req.session.accountId, req.session.basePath);
    if (enableCFR == "enabled"){
        res.locals.statusCFR = "enabled";
    }

    const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
    const sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
    if (res.locals.statusCFR == "enabled") {
        res.render('pages/invalid_with_cfr', {
            title: "Not CFR Part 11 compatible"
        });
    } else {
        res.render('pages/examples/eg039SigningInPerson', {
            eg: eg, csrfToken: req.csrfToken(),
            example: example,
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubExampleUrl + 'eSignature/examples/' + sourceFile,
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation
        });
    }
}
