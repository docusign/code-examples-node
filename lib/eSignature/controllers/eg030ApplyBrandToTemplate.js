/**
 * @file
 * Example 030: Apply Brand to Template
 * @author DocuSign
 */

const path = require('path');
const { applyBrandToTemplate, getBrands } = require('../examples/applyBrandToTemplate');
const validator = require('validator');
const dsConfig = require('../../../config/index.js').config;

const eg030ApplyBrandToTemplate = exports;
const eg = 'eg030'; // This example reference.
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;

/**
 * Create the envelope
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg030ApplyBrandToTemplate.createController = async (req, res) => {
    // Check the token
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user
    const tokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (! tokenOK) {
        req.flash('info', 'Sorry, you need to re-authenticate.');
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }

    if (!req.session.templateId) {
        res.render('pages/examples/eg030ApplyBrandToTemplate', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Apply brand to template",
            templateOk: req.session.templateId,
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubExampleUrl + 'eSignature/' + path.basename(__filename),
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation
        });
    } else {
        const { body } = req;

        //Step 1. Obtain your OAuth token
        const args = {
            accessToken: req.user.accessToken,  // Represents your {ACCESS_TOKEN}
            basePath: req.session.basePath,
            accountId: req.session.accountId,   // Represents your {ACCOUNT_ID}
            brandId: validator.escape(body.brandId),
            templateId: req.session.templateId,
            status: req.status,
            templateRoles: [
                {
                    name: validator.escape(body.signerName),
                    email: validator.escape(body.signerEmail),
                    roleName: "signer"
                },
                {
                    name: validator.escape(body.ccName),
                    email: validator.escape(body.ccEmail),
                    roleName: "cc"
                }
            ]
        };
        let results = null;

        try {
            // Step 2. Call the eSignature REST API
            results = await applyBrandToTemplate(args);
        }
        catch (error) {
            const errorBody = error && error.response && error.response.body;
            // We can pull the DocuSign error code and message from the response body
            const errorCode = errorBody && errorBody.errorCode;
            const errorMessage = errorBody && errorBody.message;
            // In production, you may want to provide customized error messages and
            // remediation advice to the user
            res.render('pages/error', {err: error, errorCode, errorMessage});
        }

        if (results) {
            res.render('pages/example_done', {
                title: "Envelope sent",
                h1: "Envelope sent",
                message: `The envelope has been created and sent!<br />Envelope ID: ${results.envelopeId}.`
            });
        }
    }
}

// ***DS.snippet.0.end

/**
 * Form page for this application
 */
eg030ApplyBrandToTemplate.getController = async (req, res) => {
    // Check that the authentication token is okay with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate,
    // since they have not yet entered any information into the form
    const tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        const args = {
            accessToken: req.user.accessToken,  // represents your {ACCESS_TOKEN}
            basePath: req.session.basePath,
            accountId: req.session.accountId,   // represents your {ACCOUNT_ID}
        };
        const brandsResponse = await getBrands(args);

        sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
        res.render('pages/examples/eg030ApplyBrandToTemplate', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Apply brand to template",
            templateOk: req.session.templateId,
            sourceFile: sourceFile,
            sourceUrl: dsConfig.githubExampleUrl + 'eSignature/examples/' + sourceFile,
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation,
            brands: brandsResponse.brands || []
        });
    } else {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
}
