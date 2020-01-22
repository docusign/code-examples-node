/**
 * @file
 * Example 024: Create new brand
 * @author DocuSign
 */

const path = require('path')
    , fs = require('fs-extra')
    , docusign = require('docusign-esign')
    , validator = require('validator')
    , dsConfig = require('../../ds_configuration.js').config
    ;

const eg024CreateBrand = exports
    , eg = 'eg024' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    , demoDocsPath = path.resolve(__dirname, '../../demo_documents')
    ;

/**
 * Create the envelope
 * @param {object} req Request obj 
 * @param {object} res Response obj
 */
eg024CreateBrand.createController = async (req, res) => {
    // Step 1: Obtain your OAuth token
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user.
    let tokenOK = req.dsAuthCodeGrant.checkToken(minimumBufferMin);
    if (! tokenOK) {
        req.flash('info', 'Sorry, you need to re-authenticate.');
        // We could store the parameters of the requested operation so it could be 
        // restarted automatically. But since it should be rare to have a token issue
        // here, we'll make the user re-enter the form data after authentication.
        req.dsAuthCodeGrant.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }

    let body = req.body
        // Additional data validation might also be appropriate
        , brandName = validator.escape(body.brandName)
        , defaultBrandLanguage = validator.escape(body.defaultBrandLanguage)

    args = {
        accessToken: req.user.accessToken,  // represents your {ACCESS_TOKEN}
        basePath: req.session.basePath,
        accountId: req.session.accountId,   // represents your {ACCOUNT_ID}
        brandName: brandName,
        defaultBrandLanguage: defaultBrandLanguage
    }
      , results = null
      ;

    // Step 2. Construct your API headers
    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(args.basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);

	
    // Step 3: Construct the request body
    let callback = {
        brand: {
            brandName: args.brandName,
            defaultBrandLanguage: args.defaultBrandLanguage
        }
    }
    let accountsApi = new docusign.AccountsApi(dsApiClient)
    
    // Step 4: Call the eSignature REST API
    try {
        results = await accountsApi.createBrand(args.accountId, callback);
    }
    catch (error) {
        let errorBody = error && error.response && error.response.body
            // we can pull the DocuSign error code and message from the response body
            , errorCode = errorBody && errorBody.errorCode
            , errorMessage = errorBody && errorBody.message
            ;
        // In production, may want to provide customized error messages and 
        // remediation advice to the user.
        res.render('pages/error', {err: error, errorCode: errorCode, errorMessage: errorMessage});
    }

    if (results) {
        req.session.brandId = results.brands[0].brandId; 	// Save for use by other examples 
														    // which need an brandId
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
eg024CreateBrand.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuthCodeGrant.checkToken();
    if (tokenOK) {
        res.render('pages/examples/eg024CreateBrand', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Signing request by email",
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubExampleUrl + path.basename(__filename),
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation
        });
    } else {
        // Save the current operation so it will be resumed after authentication
        req.dsAuthCodeGrant.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
}
