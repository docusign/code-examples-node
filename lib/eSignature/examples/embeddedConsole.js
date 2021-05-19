/**
 * @file
 * Example 012: Embedded NDSE (console)
 * @author DocuSign
 */

const docusign = require("docusign-esign");

/**
 * This function does the work of returning a URL for the NDSE view
 * @param {object} args object
 */
const createEmbeddedConsoleView = async (args) => {
  // Data for this method
  // args.basePath
  // args.accessToken
  // args.accountId
  // args.dsReturnUrl
  // args.startingView
  // args.envelopeId

  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  let envelopesApi = new docusign.EnvelopesApi(dsApiClient);

  // Step 1. create the NDSE view
  let viewRequest = makeConsoleViewRequest(args);
  // Call the CreateSenderView API
  // Exceptions will be caught by the calling function
  let results = await envelopesApi.createConsoleView(args.accountId, {
    consoleViewRequest: viewRequest,
  });
  let url = results.url;
  console.log(`NDSE view URL: ${url}`);
  return { redirectUrl: url };
};

function makeConsoleViewRequest(args) {
  // Data for this method
  // args.dsReturnUrl
  // args.startingView
  // args.envelopeId

  let viewRequest = new docusign.ConsoleViewRequest();
  // Set the url where you want the recipient to go once they are done
  // with the NDSE. It is usually the case that the
  // user will never "finish" with the NDSE.
  // Assume that control will not be passed back to your app.
  viewRequest.returnUrl = args.dsReturnUrl;
  if (args.startingView == "envelope" && args.envelopeId) {
    viewRequest.envelopeId = args.envelopeId;
  }
  return viewRequest;
}

module.exports = { createEmbeddedConsoleView };
