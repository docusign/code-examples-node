/**
 * @file
 * Example 043: Share access to a DocuSign envelope inbox
 * @author DocuSign
 */

const path = require("path");
const { createAgent, createAuthorization, getEnvelopes } = require("../examples/sharedAccess");
const validator = require("validator");
const { getExampleByNumber } = require("../../manifestService");
const dsConfig = require("../../../config/index.js").config;
const { API_TYPES } = require('../../utils.js');
const { getUserInfo } = require('../getData');

const eg043SharedAccess = exports;
const exampleNumber = 43;
const eg = `eg0${exampleNumber}`; // This example reference.
const api = API_TYPES.ESIGNATURE;
const mustAuthenticate = "/ds/mustAuthenticate";
const minimumBufferMin = 3;

/**
 * Create the agent user
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg043SharedAccess.createController = async (req, res) => {
  // check the token
  const isTokenOK = req.dsAuth.checkToken(minimumBufferMin);
  if (!isTokenOK) {
    req.flash("info", "Sorry, you need to re-authenticate.");
    // Save the current operation so it will be resumed after authentication
    req.dsAuth.setEg(req, eg);
    return res.redirect(mustAuthenticate);
  }

  // Step 3 Start. Create the agent user
  const { body } = req;
  const args = {
    accessToken: req.user.accessToken,
    basePath: req.session.basePath,
    accountId: req.session.accountId,
    email: validator.escape(body.email),
    userName: validator.escape(body.user_name),
    activation: validator.escape(body.activation),
  };
  let results = null;

  try {
    results = await createAgent(args);
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
    const agentUserId = results.userId;
    req.session.agentUserId = agentUserId;

    const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
    res.render("pages/example_done", {
      title: 'Agent user created',
      message: example.ResultsPageText,
      json: JSON.stringify(results),
      redirectUrl: `/${eg}auth`,
    });
  }
};

/**
 * Create authorization for agent user
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg043SharedAccess.createAuthorizationController = async (req, res) => {
  // check the token
  const isTokenOK = req.dsAuth.checkToken(minimumBufferMin);
  if (!isTokenOK) {
    req.flash("info", "Sorry, you need to re-authenticate.");
    // Save the current operation so it will be resumed after authentication
    req.dsAuth.setEg(req, eg);
    return res.redirect(mustAuthenticate);
  }

  // Step 2. Create the authorization for agent user
  const user = await getUserInfo(req.user.accessToken, req.session.basePath);
  const args = {
    accessToken: req.user.accessToken,
    basePath: req.session.basePath,
    accountId: req.session.accountId,
    userId: user.sub,
    agentUserId: req.session.agentUserId,
  };

  try {
    await createAuthorization(args);
  } catch (error) {
    const errorBody = error && error.response && error.response.body;
    // we can pull the DocuSign error code and message from the response body
    const errorCode = errorBody && errorBody.errorCode;
    const errorMessage = errorBody && errorBody.message;

    if(errorCode === 'USER_NOT_FOUND') {
      const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
      const additionalPageData = example.AdditionalPage.filter(p => p.Name === "user_not_found")[0];

      return res.render("pages/example_done", {
        title: 'Agent user created',
        message: additionalPageData && additionalPageData.ResultsPageText,
        redirectUrl: `/${eg}auth`,
      });
    }

    // In production, may want to provide customized error messages and
    // remediation advice to the user.
    res.render("pages/error", { err: error, errorCode, errorMessage });
  }
  req.session.principalUserId = user.sub;

  const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
  const additionalPageData = example.AdditionalPage.filter(p => p.Name === "authenticate_as_agent")[0];
  res.render("pages/example_done", {
    title: 'Authenticate as the agent',
    message: additionalPageData && additionalPageData.ResultsPageText,
    redirectUrl: `/${eg}reauthenticate`,
  });
};

/**
 * Form page for this application
 */
eg043SharedAccess.getController = (req, res) => {
  // Check that the authentication token is ok with a long buffer time.
  // If needed, now is the best time to ask the user to authenticate
  // since they have not yet entered any information into the form.
  const isTokenOK = req.dsAuth.checkToken();
  if (!isTokenOK) {
    // Save the current operation so it will be resumed after authentication
    req.dsAuth.setEg(req, eg);
    return res.redirect(mustAuthenticate);
  }
  
  const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
  res.render("pages/examples/eg043SharedAccess", {
      eg: eg,
      csrfToken: req.csrfToken(),
      example: example,
      sourceFile: path.basename(__filename),
      sourceUrl:
        "https://github.com/docusign/code-examples-node/blob/master/sharedAccess.js",
      documentation: dsConfig.documentation + eg,
      showDoc: dsConfig.documentation,
    });
};

/**
 * Logout principal user and navigate to page with the list of envelopes
 */
eg043SharedAccess.reauthenticate = (req, res) => {
  // Step 3. Logout principal user and redirect to page with the list of envelopes, login as agent user
  req.logout();
  return res.redirect(`${eg}envelopes`);
}

/**
 * Form page with the list of envelopes for this application
 */
eg043SharedAccess.listEnvelopes = async (req, res) => {
  // Check that the authentication token is ok with a long buffer time.
  // If needed, now is the best time to ask the user to authenticate
  // since they have not yet entered any information into the form.
  
  const isTokenOK = req.dsAuth.checkToken();
  if (!isTokenOK) {
    // Save the current operation so it will be resumed after authentication
    req.dsAuth.setEg(req, `${eg}envelopes`);
    return res.redirect(mustAuthenticate);
  }

  // Step 4. Retrieve the list of envelopes 
  const args = {
    accessToken: req.user.accessToken,
    basePath: req.session.basePath,
    accountId: req.session.accountId,
    userId: req.session.principalUserId
  };

  let results = null;

  try {
    results = await getEnvelopes(args);
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
    const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
    let additionalPageData = null;
  
    if (results.resultSetSize > 0) {
      additionalPageData = example.AdditionalPage.filter(p => p.Name === "list_status_successful")[0];
      res.render("pages/example_done", {
        title: `Principal's envelopes visible in the agent's Shared Access UI`,
        message: additionalPageData && additionalPageData.ResultsPageText,
        json: JSON.stringify(results),
      });
    } else {
      additionalPageData = example.AdditionalPage.filter(p => p.Name === "list_status_unsuccessful")[0];
      res.render("pages/example_done", {
        title: `No envelopes in the principal user's account`,
        message: additionalPageData && additionalPageData.ResultsPageText,
      });
    }
  }
};