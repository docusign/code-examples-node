/**
 * @file
 * Example 003: List envelopes in the user's account
 * @author DocuSign
 */

const dsConfig = require('../../../config/index.js').config;
const { listEnvelope } = require('../examples/listEnvelopes');
const path = require('path');

const eg003ListEnvelopes = exports;
const eg = 'eg003'; // This example reference.
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;

/**
 * List envelopes in the user's account
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg003ListEnvelopes.createController = async (req, res) => {
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
    const args = {
        accessToken: req.user.accessToken,
        basePath: req.session.basePath,
        accountId: req.session.accountId,
    };
    let results = null;

    try {
        results = await listEnvelope(args);
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
            title: "List envelopes results",
            h1: "Envelopes updated",
            message: `Results from the Envelopes::listStatusChanges method:`,
            json: JSON.stringify(results)
        });
    }
}

/**
 * Form page for this application
 */
eg003ListEnvelopes.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    const tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
        res.render('pages/examples/eg003ListEnvelopes', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "List envelopes",
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
