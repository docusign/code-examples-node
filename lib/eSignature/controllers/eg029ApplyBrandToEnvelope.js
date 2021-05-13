/**
 * @file
 * Example 029: Apply brand to envelope
 * @author DocuSign
 */

const path = require('path')
    , applyBrandToEnvelope = require('../examples/applyBrandToEnvelope')
    , validator = require('validator')
    , dsConfig = require('../../../config/index.js').config
    ;

const eg029ApplyBrandToEnvelope = exports
    , eg = 'eg029' // This example reference
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    , demoDocsPath = path.resolve(__dirname, '../../../demo_documents')
    , doc2File = 'World_Wide_Corp_Battle_Plan_Trafalgar.docx'
    , doc3File = 'World_Wide_Corp_lorem.pdf'
    ;

/**
 * Create the envelope
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg029ApplyBrandToEnvelope.createController = async (req, res) => {
    // Check the token
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user
    let tokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (! tokenOK) {
        req.flash('info', 'Sorry, you need to re-authenticate.');
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }

    // Step 2. Call the worker method
    let body = req.body
        // Additional data validation might also be appropriate
      , signerEmail = validator.escape(body.signerEmail)
      , signerName = validator.escape(body.signerName)
      , brandId = validator.escape(body.brandId)
      , envelopeArgs = {
            signerEmail: signerEmail,
            signerName: signerName,
            brandId,
            status: "sent",
            doc2File: path.resolve(demoDocsPath, doc2File),
            doc3File: path.resolve(demoDocsPath, doc3File)
        }
      , args = {
            accessToken: req.user.accessToken,
            basePath: req.session.basePath,
            accountId: req.session.accountId,
            envelopeArgs: envelopeArgs
        }
      , results = null
      ;

    try {
        results = await applyBrandToEnvelope.createEnvelope (args)
    }
    catch (error) {
        let errorBody = error && error.response && error.response.body
            // We can pull the DocuSign error code and message from the response body
          , errorCode = errorBody && errorBody.errorCode
          , errorMessage = errorBody && errorBody.message
          ;
        // In production, you may want to provide customized error messages and
        // remediation advice to the user
        res.render('pages/error', {err: error, errorCode: errorCode, errorMessage: errorMessage});
    }
    if (results) {
        req.session.envelopeId = results.envelopeId;
        // Save for use by other examples that need an envelopeId
        res.render('pages/example_done', {
            title: "Envelope sent",
            h1: "Envelope sent",
            message: `The envelope has been created and sent!<br/>Envelope ID ${results.envelopeId}.`
        });
    }
}

/**
 * Form page for this application
 */
eg029ApplyBrandToEnvelope.getController = async (req, res) => {
    // Check that the authentication token is okay with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate,
    // since they have not yet entered any information into the form
    let tokenOK = req.dsAuth.checkToken()

    if (tokenOK) {
        let args = {
            accessToken: req.user.accessToken,  // represents your {ACCESS_TOKEN}
            basePath: req.session.basePath,
            accountId: req.session.accountId,   // represents your {ACCOUNT_ID}
        }
        let brandsResponse = await applyBrandToEnvelope.getBrands(args)

        res.render('pages/examples/eg029ApplyBrandToEnvelope', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Signing request by email",
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubExampleUrl + 'eSignature/' + path.basename(__filename),
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
