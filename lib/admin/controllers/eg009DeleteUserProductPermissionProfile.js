/**
 * @file
 * Example 009: Delete user product permission profiles using an email address
 * @author DocuSign
 */

const path = require('path')
const validator = require('validator');
const { deleteUserProductPermissionProfile, getProductPermissionProfilesByEmail } = require('../examples/deleteUserProductPermissionProfile');
const { getExampleByNumber } = require("../../manifestService");
const dsConfig = require('../../../config/index.js').config;
const { getOrganizationId } = require("../getOrganizationId.js");
const { checkUserExistsByEmail } = require("../getData.js");

const eg009DeleteUserProductPermissionProfile = exports;
const exampleNumber = 9;
const eg = `eg00${exampleNumber}`; // This example reference.
const mustAuthenticate = '/ds/mustAuthenticate';
const minimumBufferMin = 3;

/**
 * Delete user product permission profiles using an email address
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg009DeleteUserProductPermissionProfile.createController = async (req, res) => {
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
  const example = getExampleByNumber(res.locals.manifest, exampleNumber);
  if (!userEmail || !await checkUserExistsByEmail(req, userEmail)) {
    return res.render("pages/admin-examples/eg009DeleteUserProductPermissionProfile", {
      eg: eg, csrfToken: req.csrfToken(),
      example: example,
      emailOk: false,
      sourceFile: sourceFile,
      sourceUrl: dsConfig.githubExampleUrl + 'admin/examples/' + sourceFile,
      documentation: dsConfig.documentation + eg,
      showDoc: dsConfig.documentation
    });
  }

  const body = req.body;
  const args = {
    accessToken: req.user.accessToken,
    basePath: dsConfig.adminAPIUrl,
    accountId: req.session.accountId,
    organizationId: req.session.organizationId,
    email: req.session.clmEmail,
    productId: validator.escape(body.productId)
  }
  
  let results = null;
  try {
    results = await deleteUserProductPermissionProfile(args);
  } catch (error) {
    const errorBody = error && error.response && error.response.body;
    // we can pull the DocuSign error code and message from the response body
    const errorCode = error && error.status || errorBody && errorBody.errorCode;
    const errorMessage = errorBody && errorBody.error_description || errorBody.message;

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
eg009DeleteUserProductPermissionProfile.getController = async (req, res) => {
  // Check that the authentication token is ok with a long buffer time.
  // If needed, now is the best time to ask the user to authenticate
  // since they have not yet entered any information into the form.
  const isTokenOK = req.dsAuth.checkToken();
  if (!isTokenOK) {
    req.flash("info", "Sorry, you need to re-authenticate.");
    // Save the current operation so it will be resumed after authentication
    req.dsAuth.setEg(req, eg);
    return res.redirect(mustAuthenticate);
  }
  
  await getOrganizationId(req);

  const userEmail = req.session.clmEmail;
  const example = getExampleByNumber(res.locals.manifest, exampleNumber);
  const sourceFile = (path.basename(__filename))[5].toLowerCase() + (path.basename(__filename)).substr(6);
  if (!userEmail || !await checkUserExistsByEmail(req, userEmail)) {
    return res.render("pages/admin-examples/eg009DeleteUserProductPermissionProfile", {
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
      organizationId: req.session.organizationId,
      email: req.session.clmEmail
    };

    const productPermissionProfiles = await getProductPermissionProfilesByEmail(args);
    let permissionProfileList = [];
    let permissionName;

    // Create the permission profile list that will be used on example page
    if (productPermissionProfiles && productPermissionProfiles.length > 0) {
      productPermissionProfiles.forEach(product => {
        let permissionProfiles = product["permission_profiles"];

        permissionProfiles.forEach(profile => {
          permissionName = product["product_name"].includes("CLM")
            ? `CLM - ${profile["permission_profile_name"]}`
            : `eSignature - ${profile["permission_profile_name"]}`;

          // Add current permission profile data to the list if it was not added yet
          if (permissionProfileList.filter(prof => prof["productId"] === product["product_id"]).length === 0) {
            permissionProfileList.push({ productId: product["product_id"], permissionName });
          }
        });
      });
    }

    res.render("pages/admin-examples/eg009DeleteUserProductPermissionProfile", {
      eg: eg, csrfToken: req.csrfToken(),
      example: example,
      permissionProfileList: permissionProfileList,
      emailOk: true,
      email: req.session.clmEmail,
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
