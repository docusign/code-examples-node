/**
 * @file
 * Example 015: Get an envelope's tab (field) data
 * @author DocuSign
 */

const path = require('path');
const { getEnvelopeFormData } = require('../examples/envelopeTabData');
const dsConfig = require('../../../config/index.js').config;

const eg015EnvelopeTabData = exports;
const eg = 'eg015'; // This example reference.
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
    const tokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (! tokenOK) {
        req.flash('info', 'Sorry, you need to re-authenticate.');
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
    if (! req.session.envelopeId) {
        res.render('pages/examples/eg015EnvelopeTabData', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Get envelope tab data",
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
        res.render('pages/example_done', {
            title: "Get envelope tab data",
            h1: "Get envelope tab data",
            message: `Results from the EnvelopeFormData::get method:`,
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
    const tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
        res.render('pages/examples/eg015EnvelopeTabData', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Get envelope tab data information",
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
