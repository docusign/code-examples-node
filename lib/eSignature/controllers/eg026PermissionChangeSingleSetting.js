/**
 * @file
 * Example 026: Updateing individual permission profile settings
 * @author DocuSign
 */

const path = require('path');
const { updatePermissionProfile, getProfiles } = require('../examples/permissionChangeSingleSetting');
const validator = require('validator');
const dsConfig = require('../../../config/index.js').config;

const eg026UpdatePermissionProfile = exports;
const eg = 'eg026'; // This example reference.
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;


/**
 * Create the envelope
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg026UpdatePermissionProfile.createController = async (req, res) => {

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

    // Step 1. Obtain your OAuth token
    const args = {
        accessToken: req.user.accessToken,  // represents your {ACCESS_TOKEN}
        basePath: req.session.basePath,
        accountId: req.session.accountId,   // represents your {ACCOUNT_ID}
        selectedId: validator.escape(body.profileId),
        profileName: body.profileName && validator.escape(body.profileName)
    };
    let results = null;

    try {

        // Step 2. Call the eSignature REST API
        results = await updatePermissionProfile(args);
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
    const tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        const args = {
            accessToken: req.user.accessToken,  // represents your {ACCESS_TOKEN}
            basePath: req.session.basePath,
            accountId: req.session.accountId,   // represents your {ACCOUNT_ID}
        };

        const profiles = await getProfiles(args);

        sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
        res.render('pages/examples/eg026PermissionChangeSingleSetting', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Updateing individual permission profile settings",
            sourceFile: sourceFile,
            sourceUrl: dsConfig.githubExampleUrl + 'eSignature/examples/' + sourceFile,
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
