/**
 * @file
 * Example 008: Update user product permission profiles using an email address
 * @author DocuSign
 */

const path = require('path')
const validator = require('validator');
const { updateUserProductPermissionProfile, getProductPermissionProfiles } = require('../examples/updateUserProductPermissionProfile');
const { getExampleByNumber } = require("../../manifestService");
const dsConfig = require('../../../config/index.js').config;
const { getOrganizationId } = require("../getOrganizationId.js");
const { checkUserExistsByEmail } = require("../getData.js");
const { API_TYPES } = require('../../utils.js');

const eg008UpdateUserProductPermissionProfile = exports;
const exampleNumber = 8;
const eg = `aeg00${exampleNumber}`; // This example reference.
const api = API_TYPES.ADMIN;
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;

/**
 * Update user product permission profiles using an email address
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg008UpdateUserProductPermissionProfile.createController = async (req, res) => {
  // At this point we should have a good token. But we
  // double-check here to enable a better UX to the user.
  const isTokenOK = req.dsAuth.checkToken(minimumBufferMin);
  if (!isTokenOK) {
    req.flash("info", "Sorry, you need to re-authenticate.");
    // Save the current operation so it will be resumed after authentication
    req.dsAuth.setEg(req, eg);
    return res.redirect(mustAuthenticate);
  }

  const userEmail = req.session.clmEmail;
  const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
  if (!userEmail || !await checkUserExistsByEmail(req, userEmail)) {
    return res.render("pages/admin-examples/eg008UpdateUserProductPermissionProfile", {
      eg: eg, csrfToken: req.csrfToken(),
      example: example,
      emailOk: false,
      sourceFile: sourceFile,
      sourceUrl: dsConfig.githubExampleUrl + 'admin/examples/' + sourceFile,
      documentation: dsConfig.documentation + eg,
      showDoc: dsConfig.documentation
    });
  }

  const { body } = req;
  
  const productId = validator.escape(body.productId);
  let args = {
    accessToken: req.user.accessToken,
    basePath: dsConfig.adminAPIUrl,
    accountId: req.session.accountId,
    organizationId: req.session.organizationId,
    email: req.session.clmEmail,
    productId: productId
  };

  const { clmProductId } = await getProductPermissionProfiles(args);
  
  args.permissionProfileId = productId === clmProductId
    ? validator.escape(body.clmPermissionProfileId)
    : validator.escape(body.eSignPermissionProfileId)

  let results = null;
  try {
    results = await updateUserProductPermissionProfile(args);
  } catch (error) {
    const errorBody = error && error.response && error.response.body;
    // we can pull the DocuSign error code and message from the response body
    const errorCode = errorBody && errorBody.errorCode;
    const errorMessage = errorBody && errorBody.message;

    // In production, may want to provide customized error messages and
    // remediation advice to the user.
    res.render("pages/error", { err: error, errorCode, errorMessage });
  }
  if (results) {
    res.render("pages/example_done", {
      title: example.ExampleName,
      message: example.ResultsPageText,
      json: JSON.stringify(results).replace(/'/g, '')
    });
  }
}

/**
 * Form page for this application
 */
eg008UpdateUserProductPermissionProfile.getController = async (req, res) => {
  // Check that the authentication token is ok with a long buffer time.
  // If needed, now is the best time to ask the user to authenticate
  // since they have not yet entered any information into the form.
  const isTokenOK = req.dsAuth.checkToken();
  if (!isTokenOK) {
    // Save the current operation so it will be resumed after authentication
    req.dsAuth.setEg(req, eg);
    return res.redirect(mustAuthenticate);
  }

  await getOrganizationId(req);

  const userEmail = req.session.clmEmail;
  const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
  const sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
  if (!userEmail || !await checkUserExistsByEmail(req, userEmail)) {
    return res.render("pages/admin-examples/eg008UpdateUserProductPermissionProfile", {
      eg: eg, csrfToken: req.csrfToken(),
      example: example,
      emailOk: false,
      sourceFile: sourceFile,
      sourceUrl: dsConfig.githubExampleUrl + 'admin/examples/' + sourceFile,
      documentation: dsConfig.documentation + eg,
      showDoc: dsConfig.documentation
    });
  }

  try {
    const args = {
      accessToken: req.user.accessToken,
      basePath: dsConfig.adminAPIUrl,
      accountId: req.session.accountId,
      organizationId: req.session.organizationId
    };

    const { clmPermissionProfiles, eSignPermissionProfiles, products } = await getProductPermissionProfiles(args);

    res.render("pages/admin-examples/eg008UpdateUserProductPermissionProfile", {
      eg: eg, csrfToken: req.csrfToken(),
      example: example,
      clmPermissionProfiles: clmPermissionProfiles,
      eSignPermissionProfiles: eSignPermissionProfiles,
      emailOk: true,
      email: req.session.clmEmail,
      products: products,
      sourceFile: sourceFile,
      sourceUrl: dsConfig.githubExampleUrl + 'admin/examples/' + sourceFile,
      documentation: dsConfig.documentation + eg,
      showDoc: dsConfig.documentation
    });
  } catch (error) {
    const errorBody = error && error.response && error.response.body;
    // we can pull the DocuSign error code and message from the response body
    const errorCode = errorBody && errorBody.errorCode;
    const errorMessage = errorBody && errorBody.message;

    // In production, may want to provide customized error messages and
    // remediation advice to the user.
    res.render("pages/error", { err: error, errorCode: errorCode, errorMessage: errorMessage });
  }
}
