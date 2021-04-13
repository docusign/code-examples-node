/**
 * @file
 * Example 028: Create new brand
 * @author DocuSign
 */

const path = require('path')
    , docusign = require('docusign-esign')
    , validator = require('validator')
    , dsConfig = require('../../config/index.js').config
    ;

const eg028CreateBrand = exports
    , eg = 'eg028' // This example reference
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    ;

/**
 * Create the envelope
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg028CreateBrand.createController = async (req, res) => {
    // Check the token
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user
    let tokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (!tokenOK) {
        req.flash('info', 'Sorry, you need to re-authenticate.');
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }

    let body = req.body
        // Additional data validation might also be appropriate
        , brandName = validator.escape(body.brandName)
        , defaultBrandLanguage = validator.escape(body.defaultBrandLanguage)
    // Step 1. Obtain your OAuth token
    args = {
        accessToken: req.user.accessToken,  // Represents your {ACCESS_TOKEN}
        basePath: req.session.basePath,
        accountId: req.session.accountId,   // Represents your {ACCOUNT_ID}
        brandName: brandName,
        defaultBrandLanguage: defaultBrandLanguage
    }
        , results = null
        ;

    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(args.basePath);

    // Step 2. Construct your API headers
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    let accountsApi = new docusign.AccountsApi(dsApiClient)

    // Step 3. Construct the request body
    let callback = {
        brand: {
            brandName: args.brandName,
            defaultBrandLanguage: args.defaultBrandLanguage
        }
    }
    try {
        // Step 4. Call the eSignature REST API
        results = await accountsApi.createBrand(args.accountId, callback);
    }
    catch (error) {
        let errorBody = error && error.response && error.response.body
            // We can pull the DocuSign error code and message from the response body
            , errorCode = errorBody && errorBody.errorCode
            , errorMessage = errorBody && errorBody.message
            ;
        // In production, you may want to provide customized error messages and
        // remediation advice to the user
        res.render('pages/error', { err: error, errorCode: errorCode, errorMessage: errorMessage });
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
    let tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        res.render('pages/examples/eg028CreateBrand', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Signing request by email",
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubExampleUrl + 'eSignature/' + path.basename(__filename),
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation
        });
    } else {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
}
