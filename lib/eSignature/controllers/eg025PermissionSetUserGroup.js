/**
 * @file
 * Example 025: The permission was set
 * @author DocuSign
 */

const path = require('path');
const { setPermission, getGroupsAndPermissions } = require('../examples/permissionSetUserGroup');
const validator = require('validator');
const dsConfig = require('../../../config/index.js').config;

const eg025PermissionSetUserGroup = exports;
const eg = 'eg025'; // This example reference.
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;

/**
 * Create the envelope
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg025PermissionSetUserGroup.createController = async (req, res) => {

    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user.
    const tokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (!tokenOK) {
        req.flash('info', 'Sorry, you need to re-authenticate.');
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }

    const { body } = req;
    // Step 1: Obtain your OAuth token
    const args = {
        accessToken: req.user.accessToken,  // represents your {ACCESS_TOKEN}
        basePath: req.session.basePath,
        accountId: req.session.accountId,   // represents your {ACCOUNT_ID}
        permissionProfileId: validator.escape(body.permissionProfileId),
        userGroupId: validator.escape(body.userGroupId)
    };
    let results = null;

    try {
        // Step 2: Call the eSignature REST API
        results = await setPermission(args);
    }
    catch (error) {
        const errorBody = error && error.response && error.response.body;
        // we can pull the DocuSign error code and message from the response body
        const errorCode = errorBody && errorBody.errorCode;
        const errorMessage = errorBody && errorBody.message;
        // In production, may want to provide customized error messages and
        // remediation advice to the user.
        res.render('pages/error', { err: error, errorCode, errorMessage });
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
    const tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        const args = {
            accessToken: req.user.accessToken,  // represents your {ACCESS_TOKEN}
            basePath: req.session.basePath,
            accountId: req.session.accountId,   // represents your {ACCOUNT_ID}
        }
        const results = await getGroupsAndPermissions(args);

        sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
        res.render('pages/examples/eg025PermissionSetUserGroup', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "The permission set",
            sourceFile: sourceFile,
            sourceUrl: dsConfig.githubExampleUrl + 'eSignature/examples/' + sourceFile,
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
