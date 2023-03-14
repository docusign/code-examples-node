/**
 * @file
 * Example 006: Get user profile data by email
 * @author DocuSign
 */

const path = require('path');
const { getUserProfileByEmail } = require('../examples/getUserProfileByEmail');
const dsConfig = require('../../../config/index.js').config;
const validator = require('validator');
const { getOrganizationId } = require("../getOrganizationId.js");
const { getExampleByNumber } = require("../../manifestService");
const { API_TYPES } = require('../../utils.js');
 
const eg006GetUserProfileByEmail = exports;
const exampleNumber = 6;
const eg = `aeg00${exampleNumber}`; // This example reference.
const api = API_TYPES.ADMIN;
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;
 
/**
 * Getting user profile by email
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg006GetUserProfileByEmail.createController = async(req, res) => {
  // Step 1. Check the token
  // At this point we should have a good token. But we
  // double-check here to enable a better UX to the user.
  const isTokenOK = req.dsAuth.checkToken(minimumBufferMin);
  if (!isTokenOK) {
    req.flash('info', 'Sorry, you need to re-authenticate.');
    // Save the current operation so it will be resumed after authentication
    req.dsAuth.setEg(req, eg);
    return res.redirect(mustAuthenticate);
  }

  const { body } = req;
  const args = {
      accessToken: req.user.accessToken,
      email: validator.escape(body.email),
      accountId: req.session.accountId,
      organizationId: req.session.organizationId,
      basePath: dsConfig.adminAPIUrl
    };

  let results = null;

  try {
    results = await getUserProfileByEmail(args)
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
   const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
   res.render('pages/example_done', {
     title: example.ExampleName,
     message: example.ResultsPageText,
     json: JSON.stringify(results)
   });
  }
}

/**
 * Form page for this application
 */
eg006GetUserProfileByEmail.getController = async (req, res) => {
  // Check that the authentication token is ok with a long buffer time.
  // If needed, now is the best time to ask the user to authenticate
  // since they have not yet entered any information into the form.

  const isTokenOK = req.dsAuth.checkToken();
  if (!isTokenOK) {
    // Save the current operation so it will be resumed after authentication
    req.dsAuth.setEg(req, eg);
    return res.redirect(mustAuthenticate);
  }

  try {
    await getOrganizationId(req);

    const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
    const sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
    res.render('pages/admin-examples/eg006GetUserProfileByEmail', {
      eg: eg,
      csrfToken: req.csrfToken(),
      example: example,
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
}
 