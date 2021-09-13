/**
 * @file
 * Example 002: Create active user for CLM and eSignature
 * @author DocuSign
 */

const path = require('path')
const { createCLMESignUser, getProductPermissionProfiles, getDSAdminGroups } = require('../examples/createCLMESignUser');
const dsConfig = require('../../../config/index.js').config;
const validator = require('validator');
const { getOrganizationId } = require("../getOrganizationId.js");

const eg002CreateCLMESignUser = exports;
const eg = 'eg002' // This example reference.;
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;

/**
 * Creating a new user with active status
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg002CreateCLMESignUser.createController = async (req, res) => {
  // At this point we should have a good token. But we
  // double-check here to enable a better UX to the user.
  let tokenOK = req.dsAuth.checkToken(minimumBufferMin);
  if (!tokenOK) {
    req.flash("info", "Sorry, you need to re-authenticate.");
    // Save the current operation so it will be resumed after authentication
    req.dsAuth.setEg(req, eg);
    res.redirect(mustAuthenticate);
  }

  let results = null;
  const body = req.body;
  const args = {
    accessToken: req.user.accessToken,
    basePath: req.session.basePath,
    accountId: req.session.accountId,
    organizationId: req.session.organizationId,
    userName: validator.escape(body.userName),
    firstName: validator.escape(body.firstName),
    lastName: validator.escape(body.lastName),
    email: validator.escape(body.email),
    clmProductId: validator.escape(body.clmProductId),
    eSignProductId: validator.escape(body.eSignProductId),
    clmPermissionProfileId: validator.escape(body.clmPermissionProfileId),
    eSignPermissionProfileId: validator.escape(body.eSignPermissionProfileId),
    dsGroupId: validator.escape(body.dsGroupId)
  }

  try {
    results = await createCLMESignUser(args)
  }
  catch (error) {
    let errorBody = error && error.response && error.response.body
      // we can pull the DocuSign error code and message from the response body
      , errorCode = errorBody && errorBody.errorCode
      , errorMessage = errorBody && errorBody.message
      ;
    // In production, may want to provide customized error messages and
    // remediation advice to the user.
    res.render("pages/error", { err: error, errorCode, errorMessage });
  }
  if (results) {
    res.render("pages/example_done", {
      title: "Create active user for CLM and eSignature",
      h1: "Create active user for CLM and eSignature",
      message: "Results from MultiProductUserManagement:addOrUpdateUser method:",
      json: JSON.stringify(results).replace(/'/g, '')
    });
  }
}

/**
 * Form page for this application
 */
eg002CreateCLMESignUser.getController = async (req, res) => {
  // Check that the authentication token is ok with a long buffer time.
  // If needed, now is the best time to ask the user to authenticate
  // since they have not yet entered any information into the form.
  let tokenOK = req.dsAuth.checkToken();
  if (tokenOK) {
    try {
      await getOrganizationId(req)
      const args = {
        accessToken: req.user.accessToken,
        accountId: req.session.accountId,
        organizationId: req.session.organizationId
      };

      let productPermissionProfiles = await getProductPermissionProfiles(args);
      let dsGroups = await getDSAdminGroups(args);

      sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
      res.render("pages/admin-examples/eg002CreateCLMESignUser", {
        eg: eg, csrfToken: req.csrfToken(),
        title: "Create active user for CLM and eSignature",
        clmPermissionProfiles: productPermissionProfiles.clmPermissionProfiles,
        eSignPermissionProfiles: productPermissionProfiles.eSignPermissionProfiles,
        dsGroups,
        clmProductId: productPermissionProfiles.clmProductId,
        eSignProductId: productPermissionProfiles.eSignProductId,
        sourceFile: sourceFile,
        sourceUrl: dsConfig.githubExampleUrl + 'admin/examples/' + sourceFile,
        documentation: dsConfig.documentation + eg,
        showDoc: dsConfig.documentation
      });
    }
    catch (error) {
      let errorBody = error && error.response && error.response.body
        // we can pull the DocuSign error code and message from the response body
        , errorCode = errorBody && errorBody.errorCode
        , errorMessage = errorBody && errorBody.message
        ;
      // In production, may want to provide customized error messages and
      // remediation advice to the user.
      res.render("pages/error", { err: error, errorCode: errorCode, errorMessage: errorMessage });
    }
  } else {
    // Save the current operation so it will be resumed after authentication
    req.dsAuth.setEg(req, eg);
    res.redirect(mustAuthenticate);
  }
}
