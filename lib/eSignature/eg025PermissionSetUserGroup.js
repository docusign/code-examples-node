/**
 * @file
 * Example 025: The permission was set
 * @author DocuSign
 */

const path = require('path')
    , docusign = require('docusign-esign')
    , validator = require('validator')
    , dsConfig = require('../../config/index.js').config
    ;

const eg025PermissionSetUserGroup = exports
    , eg = 'eg025' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    ;

/**
 * Create the envelope
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg025PermissionSetUserGroup.createController = async (req, res) => {

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
        , permissionProfileId = validator.escape(body.permissionProfileId)
        , userGroupId = validator.escape(body.userGroupId)

    // Step 1: Obtain your OAuth token
    args = {
        accessToken: req.user.accessToken,  // represents your {ACCESS_TOKEN}
        basePath: req.session.basePath,
        accountId: req.session.accountId,   // represents your {ACCOUNT_ID}
    }
        , results = null
        ;


    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(args.basePath);

    // Step 2. Construct your API headers
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    let groupApi = new docusign.GroupsApi(dsApiClient);

    // Step 3: Construct the reqeust body
    const requestBody = {
        groupInformation: {
            groups: [
                {
                    permissionProfileId: permissionProfileId,
                    groupId: userGroupId
                }
            ]
        }
    };

    try {
        // Step 4: Call the eSignature REST API
        results = await groupApi.updateGroups(args.accountId, requestBody);
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
            title: "The permission set",
            h1: "The permission profile was successfully set to the user group",
            message: "The permission profile was successfully set to the user group!"
        });
    }
}

// ***DS.snippet.0.end

/**
* Form page for this application
*/
eg025PermissionSetUserGroup.getController = async (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {

        let dsApiClient = new docusign.ApiClient();
        dsApiClient.setBasePath(req.session.basePath);
        dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + req.user.accessToken);

        let accountApi = new docusign.AccountsApi(dsApiClient)
        let listPermissions = await accountApi.listPermissions(req.session.accountId)

        let groupApi = new docusign.GroupsApi(dsApiClient)
        let userGroups = await groupApi.listGroups(req.session.accountId)

        res.render('pages/examples/eg025PermissionSetUserGroup', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "The permission set",
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubExampleUrl + 'eSignature/' + path.basename(__filename),
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation,
            groups: userGroups.groups || [],
            permissions: listPermissions.permissionProfiles || []
        });
    } else {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
}
