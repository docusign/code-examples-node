/**
 * @file
 * Example 004: Add user via bulk import
 * @author DocuSign
 */
const path = require('path');
const { createBulkImportRequest } = require('../examples/importUser');
const dsConfig = require('../../../config/index.js').config;
const { getOrganizationId } = require("../getOrganizationId.js");

const eg004ImportUser = exports;
const eg = 'eg004' // This example reference.;
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;
const demoDocsPath = path.resolve(__dirname, '../../../demo_documents/');
const csvFile = 'userData.csv';

/**
 * Add user via bulk import
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg004ImportUser.createController = async(req, res) => {
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
    accountId: req.session.accountId,
    csvFilePath: path.resolve(path.join(demoDocsPath, csvFile)),
    organizationId: req.session.organizationId,
    basePath: dsConfig.adminAPIUrl
  };

  let results = null;

  try {
     results = await createBulkImportRequest(args)
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
      title: "Add users via bulk import",
      h1: "Add users via bulk import",
      message: `Results from UserImport:addBulkUserImport method:`,
      json: JSON.stringify(results)
    });
  }
}

/**
 * Form page for this application
 */
eg004ImportUser.getController = async (req, res) => {
  // Check that the authentication token is ok with a long buffer time.
  // If needed, now is the best time to ask the user to authenticate
  // since they have not yet entered any information into the form.

  const tokenOK = req.dsAuth.checkToken();
  if (tokenOK) {
    try {
      await getOrganizationId(req);

      res.render('pages/admin-examples/eg004ImportUser', {
        eg: eg,
        csrfToken: req.csrfToken(),
        title: "Add user via bulk import",
        sourceFile: path.basename(__filename),
        sourceUrl: dsConfig.githubExampleUrl + "admin/" + path.basename(__filename),
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
