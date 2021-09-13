/**
 * @file
 * Example 001: Creating a new user with active status
 * @author DocuSign
 */

const path = require('path');
const { createUser, getPermissionProfilesAndGroups } = require('../examples/createUser');
const dsConfig = require('../../../config/index.js').config;
const validator = require('validator');
const { getOrganizationId } = require("../getOrganizationId.js");

const eg001CreateUser = exports;
const eg = 'eg001' // This example reference.;
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;

/**
 * Creating a new user with active status
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg001CreateUser.createController = async(req, res) => {
  // Step 1. Check the token
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
  const args = {
      accessToken: req.user.accessToken,
      email: validator.escape(body.email),
      first_name: validator.escape(body.first_name),
      last_name: validator.escape(body.last_name),
      user_name: validator.escape(body.user_name),
      permission_profile_id: validator.escape(body.permissionProfileId),
      group_id: validator.escape(body.groupId),
      accountId: req.session.accountId,
      organizationId: req.session.organizationId,
      basePath: dsConfig.adminAPIUrl
    };

  let results = null;

  try {
    results = await createUser(args)
  } catch (error) {
    // we can pull the DocuSign error code and message from the response body
    const errorBody = error && error.response && error.response.body;
    const errorCode = errorBody && errorBody.errorCode;
    const errorMessage = errorBody && errorBody.message;

    // In production, may want to provide customized error messages and
    // remediation advice to the user.
    res.render('pages/error', { err: error, errorCode, errorMessage });
  }
  if (results) {
    res.render('pages/example_done', {
      title: "Create a new active eSignature user",
      h1: "Create a new active eSignature user",
      message: "Results from eSignUserManagement:createUser method:",
      json: JSON.stringify(results)
    });
  }
}

/**
 * Form page for this application
 */
eg001CreateUser.getController = async (req, res) => {
  // Check that the authentication token is ok with a long buffer time.
  // If needed, now is the best time to ask the user to authenticate
  // since they have not yet entered any information into the form.

  let tokenOK = req.dsAuth.checkToken();
  if (tokenOK) {
    try {
      await getOrganizationId(req);

      const args = {
        accessToken: req.user.accessToken,
        accountId: req.session.accountId,
        basePath: req.session.basePath,
        organizationId: req.session.organizationId
      };

      const { profiles, groups } = await getPermissionProfilesAndGroups(args);

      sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
      res.render('pages/admin-examples/eg001CreateUser', {
        eg: eg,
        csrfToken: req.csrfToken(),
        title: "Creating a new user",
        permissionProfiles: profiles.permissionProfiles,
        groups: groups.groups,
        sourceFile: sourceFile,
        sourceUrl: dsConfig.githubExampleUrl + "admin/examples/" + sourceFile,
        documentation: dsConfig.documentation + eg,
        showDoc: dsConfig.documentation
      });
    }
    catch (error) {
      const errorBody = error && error.response && error.response.body;
      const errorCode = errorBody && errorBody.errorCode;
      const errorMessage = errorBody && errorBody.message;

      // In production, may want to provide customized error messages and
      // remediation advice to the user.
      res.render('pages/error', { err: error, errorCode, errorMessage });
    }

  } else {
    // Save the current operation so it will be resumed after authentication
    req.dsAuth.setEg(req, eg);
    res.redirect(mustAuthenticate);
  }
}
