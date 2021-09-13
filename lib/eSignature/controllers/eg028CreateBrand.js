/**
 * @file
 * Example 028: Create new brand
 * @author DocuSign
 */

const path = require('path');
const { createBrand } = require('../examples/createBrand');
const validator = require('validator');
const dsConfig = require('../../../config/index.js').config;

const eg028CreateBrand = exports;
const eg = 'eg028'; // This example reference
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;

/**
 * Create the envelope
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg028CreateBrand.createController = async (req, res) => {
    // Check the token
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user
    const tokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (!tokenOK) {
        req.flash('info', 'Sorry, you need to re-authenticate.');
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }

    const { body } = req;

    // Step 1. Obtain your OAuth token
    const args = {
        accessToken: req.user.accessToken,  // Represents your {ACCESS_TOKEN}
        basePath: req.session.basePath,
        accountId: req.session.accountId,   // Represents your {ACCOUNT_ID}
        brandName: validator.escape(body.brandName),
        defaultBrandLanguage: validator.escape(body.defaultBrandLanguage)
    };
    let results = null;

    try {
        // Step 4. Call the eSignature REST API
        results = await createBrand(args);
    }
    catch (error) {
        const errorBody = error && error.response && error.response.body;
        // We can pull the DocuSign error code and message from the response body
        const errorCode = errorBody && errorBody.errorCode;
        const errorMessage = errorBody && errorBody.message;
        // In production, you may want to provide customized error messages and
        // remediation advice to the user
        res.render('pages/error', { err: error, errorCode, errorMessage });
    }

    if (results) {
        req.session.brandId = results.brands[0].brandId;
        // Save for use by other examples that need an brandId
        res.render('pages/example_done', {
            title: "New brand sent",
            h1: "New brand sent",
            message: `The brand has been created!<br />Brand ID: ${results.brands[0].brandId}.`
        });
    }
}

// ***DS.snippet.0.end

/**
 * Form page for this application
 */
eg028CreateBrand.getController = (req, res) => {
    // Check that the authentication token is okay with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate,
    // since they have not yet entered any information into the form
    const tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
        res.render('pages/examples/eg028CreateBrand', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Signing request by email",
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
