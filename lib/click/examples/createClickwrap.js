/**
 * @file
 * Example 1: Creating a clickwrap
 * @author DocuSign
 */

const fs = require("fs-extra");
const docusignClick = require("docusign-click");

/**
 * Work with creating of the clickwrap
 * @param {Object} args Arguments for creating a clickwrap
 * @return {Object} The object with value of clickwrapId or error
 */
const createClickwrap = async (args) => {
  // Construct the request body. Create display settings model
  //ds-snippet-start:Click1Step3
  const displaySettings = docusignClick.DisplaySettings.constructFromObject({
    consentButtonText: "I Agree",
    displayName: "Terms of Service",
    downloadable: true,
    format: "modal",
    hasAccept: true,
    mustRead: true,
    requireAccept: true,
    documentDisplay: "document",
  });

  // Create document model
  // Read and encode file. Put encoded value to Document entity.
  // The reads could raise an exception if the file is not available!
  const documentPdfExample = fs.readFileSync(args.docFile);
  const encodedExampleDocument =
    Buffer.from(documentPdfExample).toString("base64");
  const document = docusignClick.Document.constructFromObject({
    documentBase64: encodedExampleDocument,
    documentName: "Terms of Service",
    fileExtension: "pdf",
    order: 0,
  });

  // Create clickwrapRequest model
  const clickwrapRequest = docusignClick.ClickwrapRequest.constructFromObject({
    displaySettings,
    documents: [document],
    name: args.clickwrapName,
    requireReacceptance: true,
  });
  //ds-snippet-end:Click1Step3

  // Call the Click API
  //ds-snippet-start:Click1Step2
  const dsApiClient = new docusignClick.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  //ds-snippet-end:Click1Step2

  //ds-snippet-start:Click1Step4
  const accountApi = new docusignClick.AccountsApi(dsApiClient);
  const result = await accountApi.createClickwrap(args.accountId, {
    clickwrapRequest,
  });
  //ds-snippet-end:Click1Step4
  console.log(`Clickwrap was created. ClickwrapId ${result.clickwrapId}`);
  return result;
};

module.exports = { createClickwrap };
