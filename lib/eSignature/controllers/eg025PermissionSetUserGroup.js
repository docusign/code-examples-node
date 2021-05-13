/**
 * @file
 * Example 025: The permission was set
 * @author DocuSign
 */

const path = require('path')
    , permissionSetUserGroup = require('../examples/permissionSetUserGroup')
    , validator = require('validator')
    , dsConfig = require('../../../config/index.js').config
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
        , args = {
            accessToken: req.user.accessToken,  // represents your {ACCESS_TOKEN}
            basePath: req.session.basePath,
            accountId: req.session.accountId,   // represents your {ACCOUNT_ID}
            permissionProfileId: permissionProfileId,
            userGroupId: userGroupId
        }
        , results = null
        ;

    try {
        // Step 4: Call the eSignature REST API
        results = await permissionSetUserGroup.setPermission(args);
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
        let args = {
            accessToken: req.user.accessToken,  // represents your {ACCESS_TOKEN}
            basePath: req.session.basePath,
            accountId: req.session.accountId,   // represents your {ACCOUNT_ID}
        }
        let results = await permissionSetUserGroup.getGroupsAndPermissions(args);

        res.render('pages/examples/eg025PermissionSetUserGroup', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "The permission set",
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubExampleUrl + 'eSignature/' + path.basename(__filename),
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation,
            groups: results.userGroups.groups || [],
            permissions: results.listPermissions.permissionProfiles || []
        });
    } else {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
}
