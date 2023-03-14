/**
 * @file
 * Example 015: Get an envelope's tab (field) data
 * @author DocuSign
 */

const path = require('path');
const { getEnvelopeFormData } = require('../examples/envelopeTabData');
const { getExampleByNumber } = require("../../manifestService");
const dsConfig = require('../../../config/index.js').config;
const { API_TYPES } = require('../../utils.js');

const eg015EnvelopeTabData = exports;
const exampleNumber = 15;
const eg = `eg0${exampleNumber}`; // This example reference.
const api = API_TYPES.ESIGNATURE;
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;

/**
 * Get the envelope
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg015EnvelopeTabData.createController = async (req, res) => {
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
    
    const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
    if (! req.session.envelopeId) {
        res.render('pages/examples/eg015EnvelopeTabData', {
            eg: eg, csrfToken: req.csrfToken(),
            example: example,
            envelopeOk: req.session.envelopeId,
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubExampleUrl + 'eSignature/' + path.basename(__filename),
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation
        });
    }

    // Step 2. Call the worker method
    const args = {
        accessToken: req.user.accessToken,
        basePath: req.session.basePath,
        accountId: req.session.accountId,
        envelopeId: req.session.envelopeId
    };
    let results = null;

    try {
        results = await getEnvelopeFormData(args);
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
        res.render('pages/example_done', {
            title: example.ExampleName,
            message: example.ResultsPageText,
            json: JSON.stringify(results)
        });
    }
}

/**
 * Form page for this application
 */
eg015EnvelopeTabData.getController = (req, res) => {
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
    res.render('pages/examples/eg015EnvelopeTabData', {
        eg: eg, csrfToken: req.csrfToken(),
        example: example,
        envelopeOk: req.session.envelopeId,
        sourceFile: sourceFile,
        sourceUrl: dsConfig.githubExampleUrl + 'eSignature/examples/' + sourceFile,
        documentation: dsConfig.documentation + eg,
        showDoc: dsConfig.documentation
    });
}
