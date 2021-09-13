/**
 * @file
 * Example 005: Audit users
 * @author DocuSign
 */

const path = require('path');
const { auditUsers } = require('../examples/auditUsers');
const dsConfig = require('../../../config/index.js').config;
const { getOrganizationId } = require("../getOrganizationId.js");

const eg005AuditUsers = exports;
const eg = 'eg005' // This example reference.;
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;

/**
* @param {object} req Request obj
* @param {object} res Response obj
*/
eg005AuditUsers.createController = async (req, res) => {
  // At this point we should have a good token. But we
  // double-check here to enable a better UX to the user.
  let tokenOK = req.dsAuth.checkToken(minimumBufferMin);
  if (!tokenOK) {
    req.flash("info", "Sorry, you need to re-authenticate.");
    // Save the current operation so it will be resumed after authentication
    req.dsAuth.setEg(req, eg);
    res.redirect(mustAuthenticate);
  }

  await getOrganizationId(req);

  let results = null;
  const body = req.body;
  const args = {
    accessToken: req.user.accessToken,
    basePath: req.session.basePath,
    accountId: req.session.accountId,
    organizationId: req.session.organizationId
  }
  try {
    results = await auditUsers(args)

    res.render("pages/example_done", {
      title: "Audit users",
      h1: "Audit users",
      message: "Results from eSignUserManagement:getUserProfiles method:",
      json: JSON.stringify(results).replace(/'/g, '')
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
    res.render("pages/error", { err: error, errorCode, errorMessage });
  }
}

/**
* Form page for this application
*/
eg005AuditUsers.getController = async (req, res) => {
  // Check that the authentication token is ok with a long buffer time.
  // If needed, now is the best time to ask the user to authenticate
  // since they have not yet entered any information into the form.
  let tokenOK = req.dsAuth.checkToken();
  if (tokenOK) {
    try {
      sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
      res.render("pages/admin-examples/eg005AuditUsers", {
        eg: eg, csrfToken: req.csrfToken(),
        title: "Audit Users",
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
