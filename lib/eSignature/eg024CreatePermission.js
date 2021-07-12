/**
 * @file
 * Example 024: Creating a permission profile
 * @author DocuSign
 */

const path = require('path')
    , docusign = require('docusign-esign')
    , validator = require('validator')
    , dsConfig = require('../../config/index.js').config
    ;

const eg024CreatePermission = exports
    , eg = 'eg024' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    ;

/**
 * Create the envelope
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg024CreatePermission.createController = async (req, res) => {

    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user.
    let tokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (!tokenOK) {
        req.flash('info', 'Sorry, you need to re-authenticate.');
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }

    let body = req.body
        // Additional data validation might also be appropriate
        , profileName = validator.escape(body.profileName)
    // Step 1: Obtain your OAuth token
    args = {
        accessToken: req.user.accessToken,  // represents your {ACCESS_TOKEN}
        basePath: req.session.basePath,
        accountId: req.session.accountId,   // represents your {ACCOUNT_ID}
        profileName: profileName
    }
        , results = null
        ;


    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(args.basePath);

    // Step 2. Construct your API headers
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    let accountsApi = new docusign.AccountsApi(dsApiClient);

    // Step 3: Construct the request body
    const requestBody = {
        permissionProfile: {
            permissionProfileName: args.profileName,
            settings: {
                useNewDocuSignExperienceInterface: 0,
                allowBulkSending: "true",
                allowEnvelopeSending: "true",
                allowSignerAttachments: "true",
                allowTaggingInSendAndCorrect: "true",
                allowWetSigningOverride: "true",
                allowedAddressBookAccess: "personalAndShared",
                allowedTemplateAccess: "share",
                enableRecipientViewingNotifications: "true",
                enableSequentialSigningInterface: "true",
                receiveCompletedSelfSignedDocumentsAsEmailLinks: "false",
                signingUiVersion: "v2",
                useNewSendingInterface: "true",
                allowApiAccess: "true",
                allowApiAccessToAccount: "true",
                allowApiSendingOnBehalfOfOthers: "true",
                allowApiSequentialSigning: "true",
                enableApiRequestLogging: "true",
                allowDocuSignDesktopClient: "false",
                allowSendersToSetRecipientEmailLanguage: "true",
                allowVaulting: "false",
                allowedToBeEnvelopeTransferRecipient: "true",
                enableTransactionPointIntegration: "false",
                powerFormRole: "admin",
                vaultingMode: "none"
            }
        }
    };
    try {
        // Step 4: Call the eSignature REST API
        results = await accountsApi.createPermissionProfile(args.accountId, requestBody)
    }
    catch (error) {
        let errorBody = error && error.response && error.response.body
            // we can pull the DocuSign error code and message from the response body
            , errorCode = errorBody && errorBody.errorCode
            , errorMessage = errorBody && errorBody.message
            ;
        // In production, may want to provide customized error messages and
        // remediation advice to the user.
        res.render('pages/error', { err: error, errorCode: errorCode, errorMessage: errorMessage });
    }

    if (results) {
        res.render('pages/example_done', {
            title: "Profile created!",
            h1: "Profile created!",
            message: `The Profile has been created!<br /> Profile ID: ${results.permissionProfileId} <br /> Profile Name: ${results.permissionProfileName}.`
        });
    }
}

// ***DS.snippet.0.end

/**
* Form page for this application
*/
eg024CreatePermission.getController = async (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        res.render('pages/examples/eg024CreatePermission', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Creating a permission profile",
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
