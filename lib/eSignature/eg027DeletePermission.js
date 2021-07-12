/**
 * @file
 * Example 027: Deleting a permission profile
 * @author DocuSign
 */

const path = require('path')
    , docusign = require('docusign-esign')
    , validator = require('validator')
    , dsConfig = require('../../config/index.js').config
    ;

const eg027DeletePermission = exports
    , eg = 'eg027' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    ;

/**
 * Create the envelope
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg027DeletePermission.createController = async (req, res) => {

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
        , profileId = validator.escape(body.profileId)

    // Step 1: Obtain your OAuth token
    args = {
        accessToken: req.user.accessToken,  // represents your {ACCESS_TOKEN}
        basePath: req.session.basePath,
        accountId: req.session.accountId,   // represents your {ACCOUNT_ID}
        profileId
    }
        , results = null
        ;


    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(args.basePath);

    // Step 2. Construct your API headers
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    let accountsApi = new docusign.AccountsApi(dsApiClient);

    try {

        // Step 3. Call the eSignature API
        await accountsApi.deletePermissionProfile(args.accountId, profileId)
        res.render('pages/example_done', {
            title: "Profile deleted!",
            h1: "Profile deleted!",
            message: `The Profile has been deleted!<br /> Profile ID: ${profileId} <br />`
        });
    }
    catch {
        res.render('pages/example_done', {
            title: "Cannot delete profile!",
            h1: "Cannot delete profile!",
            message: `The Profile has not been deleted!<br /> Profile ID: ${profileId} <br />`
        });
    }
}

// ***DS.snippet.0.end

/**
* Form page for this application
*/
eg027DeletePermission.getController = async (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        let dsApiClient = new docusign.ApiClient();
        dsApiClient.setBasePath(req.session.basePath);
        dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + req.user.accessToken);

        let accountApi = new docusign.AccountsApi(dsApiClient)
        let profiles = await accountApi.listPermissions(req.session.accountId)
        let permissionProfiles = profiles.permissionProfiles

        res.render('pages/examples/eg027DeletePermission', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Creating a permission profile",
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubExampleUrl + 'eSignature/' + path.basename(__filename),
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation,
            profiles: permissionProfiles
        });
    } else {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
}
