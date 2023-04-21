/**
 * @file
 * Example 042: Request a signature by email with document generation
 * @author DocuSign
 */

const path = require("path");
const validator = require("validator");
const { formatString, API_TYPES } = require("../../utils.js");
const { getExampleByNumber } = require("../../manifestService");
const dsConfig = require("../../../config/index.js").config;
const { sendEnvelope } = require("../examples/documentGeneration");

const eg042DocumentGeneration = exports;
const exampleNumber = 42;
const eg = `eg0${exampleNumber}`; // This example reference.
const api = API_TYPES.ESIGNATURE;
const mustAuthenticate = "/ds/mustAuthenticate";
const minimumBufferMin = 3;
const demoDocsPath = path.resolve(__dirname, "../../../demo_documents");
const docFile = "Offer_Letter_Demo.docx";

/**
 * Request a signature by email with document generation
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg042DocumentGeneration.createController = async (req, res) => {
  // Step 1. Check the token
  // At this point we should have a good token. But we
  // double-check here to enable a better UX to the user.
  const isTokenOK = req.dsAuth.checkToken(minimumBufferMin);
  if (!isTokenOK) {
    req.flash("info", "Sorry, you need to re-authenticate.");
    // Save the current operation so it will be resumed after authentication
    req.dsAuth.setEg(req, eg);
    return res.redirect(mustAuthenticate);
  }

  // Step 2. Call the worker method
  const { body } = req;
  const envelopeArgs = {
    candidateEmail: validator.escape(body.candidate_email),
    candidateName: validator.escape(body.candidate_name),
    managerName: validator.escape(body.manager_name),
    jobTitle: validator.escape(body.job_title),
    salary: validator.escape(body.salary),
    startDate: validator.escape(body.start_date),
    docFile: path.resolve(demoDocsPath, docFile),
  };
  const args = {
    accessToken: req.user.accessToken,
    basePath: req.session.basePath,
    accountId: req.session.accountId,
    envelopeArgs: envelopeArgs
  }
  let results = null;

  try {
    results = await sendEnvelope(args);
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
    req.session.envelopeId = results.envelopeId; // Save for use by other examples
    // which need an envelopeId
    const example = getExampleByNumber(res.locals.manifest, exampleNumber, api);
    res.render("pages/example_done", {
      title: example.ExampleName,
      message: formatString(example.ResultsPageText, results.envelopeId),
    });
  }
};

/**
 * Form page for this application
 */
eg042DocumentGeneration.getController = (req, res) => {
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
  res.render("pages/examples/eg042DocumentGeneration", {
    eg: eg,
    csrfToken: req.csrfToken(),
    example: example,
    sourceFile: path.basename(__filename),
    sourceUrl: "https://github.com/docusign/code-examples-node/blob/master/documentGeneration.js",
    documentation: dsConfig.documentation + eg,
    showDoc: dsConfig.documentation,
  });
};
