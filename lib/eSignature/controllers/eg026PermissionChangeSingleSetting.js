/**
 * @file
 * Example 026: Updateing individual permission profile settings
 * @author DocuSign
 */

const path = require('path')
    , permissionChangeSingleSetting = require('../examples/permissionChangeSingleSetting')
    , validator = require('validator')
    , dsConfig = require('../../../config/index.js').config
    ;

const eg026UpdatePermissionProfile = exports
    , eg = 'eg026' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    ;


/**
 * Create the envelope
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg026UpdatePermissionProfile.createController = async (req, res) => {

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

    // Step 1. Obtain your OAuth token
    , args = {
        accessToken: req.user.accessToken,  // represents your {ACCESS_TOKEN}
        basePath: req.session.basePath,
        accountId: req.session.accountId,   // represents your {ACCOUNT_ID}
        selectedId: validator.escape(body.profileId),
        profileName: body.profileName && validator.escape(body.profileName)
    }
        , results = null
        ;

    try {

        // Step 2. Call the eSignature REST API
        results = await permissionChangeSingleSetting.updatePermissionProfile(args)
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
            title: "Permission updated",
            h1: "Permission updated",
            message: `The Permission has been updated.`
        });
    }
}

// ***DS.snippet.0.end

/**
 * Form page for this application
 */
eg026UpdatePermissionProfile.getController = async (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        let args = {
            accessToken: req.user.accessToken,  // represents your {ACCESS_TOKEN}
            basePath: req.session.basePath,
            accountId: req.session.accountId,   // represents your {ACCOUNT_ID}
        }

        let profiles = await permissionChangeSingleSetting.getProfiles(args);

        res.render('pages/examples/eg026PermissionChangeSingleSetting', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Updateing individual permission profile settings",
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubExampleUrl + 'eSignature/' + path.basename(__filename),
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation,
            profiles: profiles.permissionProfiles
        });
    } else {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
}
