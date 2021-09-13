/**
 * @file
 * Example 003: Bulk-export user data
 * @author DocuSign
 */

const path = require('path');
const { createBulkExportRequest } = require('../examples/bulkExportUserData');
const dsConfig = require('../../../config/index.js').config;
const { getOrganizationId } = require("../getOrganizationId.js");

const eg003BulkExportUserData = exports;
const eg = 'eg003' // This example reference.;
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;
const filePath = path.resolve(__dirname, '../../../docs/ExportedUserData.csv');

/**
 * Bulk-export user data
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg003BulkExportUserData.createController = async(req, res) => {
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

  const args = {
    accessToken: req.user.accessToken,
    organizationId: req.session.organizationId,
    basePath: dsConfig.adminAPIUrl,
    filePath
  };

  let results = null;

  try {
    results = await createBulkExportRequest(args)
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
      title: "Bulk-export user data",
      h1: "Bulk-export user data",
      message: `User data exported to ${args.filePath}. </br> Results from UserExport:getUserListExport method:`,
      json: JSON.stringify(results)
    });
  }
}

/**
 * Form page for this application
 */
eg003BulkExportUserData.getController = async (req, res) => {
  // Check that the authentication token is ok with a long buffer time.
  // If needed, now is the best time to ask the user to authenticate
  // since they have not yet entered any information into the form.

  const tokenOK = req.dsAuth.checkToken();
  if (tokenOK) {
    try {
      await getOrganizationId(req);

      sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
      res.render('pages/admin-examples/eg003BulkExportUserData', {
        eg: eg,
        csrfToken: req.csrfToken(),
        title: "Create bulk-export user data request",
        sourceFile: sourceFile,
        sourceUrl: dsConfig.githubExampleUrl + "admin/examples/" + sourceFile,
        documentation: dsConfig.documentation + eg,
        showDoc: dsConfig.documentation
      });
    } catch (error) {
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
