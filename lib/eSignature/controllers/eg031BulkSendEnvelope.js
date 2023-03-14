/**
 * @file
 * Example 31: Bulk sending
 * @author DocuSign
 */

const path = require('path');
const { bulkSendEnvelopes }  = require('../examples/bulkSendEnvelope');
const validator = require('validator');
const { getExampleByNumber } = require("../../manifestService");
const dsConfig = require('../../../config/index.js').config;
const { API_TYPES } = require('../../utils.js');

const eg031BulkSendEnvelopes = exports;
const exampleNumber = 31;
const eg = `eg0${exampleNumber}`; // This example reference.
const api = API_TYPES.ESIGNATURE;
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;
const doc2File = 'World_Wide_Corp_lorem.pdf';
const demoDocsPath = path.resolve(__dirname, '../../../demo_documents');

/**
 * Create the envelope
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg031BulkSendEnvelopes.createController = async (req, res) => {
    // Check the token
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user
    const isTokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (!isTokenOK) {
        req.flash('info', 'Sorry, you need to re-authenticate.');
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        return res.redirect(mustAuthenticate);
    }

    const { body } = req;
    // Additional data validation might also be appropriate
    const list1 = {
        signer: {
            name: validator.escape(body.signerName1),
            email: validator.escape(body.signerEmail1),
        },
        cc: {
            name: validator.escape(body.ccName1),
            email: validator.escape(body.ccEmail1),
        }
    };
    const list2 = {
        signer: {
            name: validator.escape(body.signerName2),
            email: validator.escape(body.signerEmail2),
        },
        cc: {
            name: validator.escape(body.ccName2),
            email: validator.escape(body.ccEmail2),
        }
    };
    // Step 1. Obtain your OAuth token
    const args = {
        accessToken: req.user.accessToken,  // Represents your {ACCESS_TOKEN}
        basePath: req.session.basePath,
        accountId: req.session.accountId,   // Represents your {ACCOUNT_ID}
        list1: list1,
        list2: list2,
        docFile: path.resolve(demoDocsPath, doc2File)
    };
    let results = null;

    try {
        results = await bulkSendEnvelopes(args);
    } catch (error) {
        console.log(error)
        const errorBody = error && error.response && error.response.body;
        // We can pull the DocuSign error code and message from the response body
        const errorCode = errorBody && errorBody.errorCode;
        const errorMessage = errorBody && errorBody.message;
        // In production, you may want to provide customized error messages and
        // remediation advice to the user
        res.render('pages/error', {err: error, errorCode, errorMessage});
    }

    if (results) {
        console.log(results)
        const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
        res.render('pages/example_done', {
            title: example.ExampleName,
            message: example.ResultsPageText,
            json: JSON.stringify(results)
        });
    }
}

// ***DS.snippet.0.end

/**
 * Form page for this application
 */
eg031BulkSendEnvelopes.getController = async (req, res) => {
    // Check that the authentication token is okay with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate,
    // since they have not yet entered any information into the form
    const isTokenOK = req.dsAuth.checkToken();
    if (!isTokenOK) {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        return res.redirect(mustAuthenticate);
    }

    const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
    const sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
    res.render('pages/examples/eg031BulkSendEnvelopes', {
        eg: eg, csrfToken: req.csrfToken(),
        example: example,
        sourceFile: sourceFile,
        sourceUrl: dsConfig.githubExampleUrl + 'eSignature/examples/' + sourceFile,
        documentation: dsConfig.documentation + eg,
        showDoc: dsConfig.documentation
    });
}
