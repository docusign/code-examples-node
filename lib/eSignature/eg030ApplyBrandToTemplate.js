/**
 * @file
 * Example 030: Apply Brand to Template
 * @author DocuSign
 */

const path = require('path')
    , docusign = require('docusign-esign')
    , validator = require('validator')
    , dsConfig = require('../../config/index.js').config
    ;

const eg030ApplyBrandToTemplate = exports
    , eg = 'eg030' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    ;

/**
 * Create the envelope
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg030ApplyBrandToTemplate.createController = async (req, res) => {
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

    let body = req.body
        // Additional data validation might also be appropriate
        , signerEmail = validator.escape(body.signerEmail)
        , signerName = validator.escape(body.signerName)
        , ccEmail = validator.escape(body.ccEmail)
        , ccName = validator.escape(body.ccName)
        , brandId = validator.escape(body.brandId)
        , templateId = validator.escape(body.templateId)

    //Step 1. Obtain your OAuth token
    args = {
        accessToken: req.user.accessToken,  // Represents your {ACCESS_TOKEN}
        basePath: req.session.basePath,
        accountId: req.session.accountId,   // Represents your {ACCOUNT_ID}
        brandId: brandId,
        templateId: templateId,
        status: req.status,
        templateRoles: [
            {
                name: signerName,
                email: signerEmail,
                roleName: "signer"
            },
            {
                name: ccName,
                email: ccEmail,
                roleName: "cc"
            }
        ]
    }
      , results = null
      ;

    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(args.basePath);

    // Step 2. Construct your API headers
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);

    let envelopesApi = new docusign.EnvelopesApi(dsApiClient);

    // Step 3. Construct your request body
    const envDef = {
        envelopeDefinition: {
            templateId: args.templateId,
            brandId: args.brandId,
            templateRoles: args.templateRoles,
            status: "sent"
        }
    };

    try {
        // Step 4. Call the eSignature REST API
        results = await envelopesApi.createEnvelope(args.accountId, envDef)
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
        res.render('pages/example_done', {
            title: "Envelope sent",
            h1: "Envelope sent",
            message: `The envelope has been created and sent!<br />Envelope ID: ${results.envelopeId}.`
        });
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
    let tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {

        let dsApiClient = new docusign.ApiClient();
        dsApiClient.setBasePath(req.session.basePath);
        dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + req.user.accessToken);

        let templatesApi = new docusign.TemplatesApi(dsApiClient)
        templatesResponse = await templatesApi.listTemplates(req.session.accountId);

        let brandApi = new docusign.AccountsApi(dsApiClient)
        brandsResponse = await brandApi.listBrands(req.session.accountId)

        res.render('pages/examples/eg030ApplyBrandToTemplate', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Apply brand to template",
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubExampleUrl + 'eSignature/' + path.basename(__filename),
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation,
            brands: brandsResponse.brands || [],
            templates: templatesResponse.envelopeTemplates || []
        });
    } else {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
}
