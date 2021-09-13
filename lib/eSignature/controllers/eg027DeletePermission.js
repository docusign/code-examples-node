/**
 * @file
 * Example 027: Deleting a permission profile
 * @author DocuSign
 */

const path = require('path');
const { deletePermission, getPermissions } = require('../examples/deletePermission');
const validator = require('validator');
const dsConfig = require('../../../config/index.js').config;

const eg027DeletePermission = exports;
const eg = 'eg027'; // This example reference.
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;

/**
 * Create the envelope
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg027DeletePermission.createController = async (req, res) => {

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
    // Additional data validation might also be appropriate
    const profileId = validator.escape(body.profileId)

    // Step 1: Obtain your OAuth token
    const args = {
        accessToken: req.user.accessToken,  // represents your {ACCESS_TOKEN}
        basePath: req.session.basePath,
        accountId: req.session.accountId,   // represents your {ACCOUNT_ID}
        profileId
    };


    try {

        // Step 2. Call the eSignature API
        await deletePermission(args);
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
    const tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        const args = {
            accessToken: req.user.accessToken,  // represents your {ACCESS_TOKEN}
            basePath: req.session.basePath,
            accountId: req.session.accountId,   // represents your {ACCOUNT_ID}
        };

        const permissionProfiles = await getPermissions(args);

        sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
        res.render('pages/examples/eg027DeletePermission', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Creating a permission profile",
            sourceFile: sourceFile,
            sourceUrl: dsConfig.githubExampleUrl + 'eSignature/examples/' + sourceFile,
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
