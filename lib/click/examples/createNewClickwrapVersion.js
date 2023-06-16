/**
 * @file
 * Example 3: Create a new elastic template version
 * @author DocuSign
 */

const fs = require("fs-extra");
const docusignClick = require("docusign-click");

/**
 * Work with creating the new elastic template version
 * @param {Object} args Arguments for creating clickwrap
 * @return {Object} The object with value of clickwrapId or error
 */
const createNewClickwrapVersion = async (args) => {
  // Construct the request Body. Create display settings model
  //ds-snippet-start:Click3Step3
  const displaySettings = docusignClick.DisplaySettings.constructFromObject({
    consentButtonText: "I Agree",
    displayName: `${args.clickwrapName} v2`,
    downloadable: false,
    format: "modal",
    mustRead: true,
    requireAccept: false,
    documentDisplay: "document",
    sendToEmail: false,
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
    status: "active",
  });
  //ds-snippet-end

  // Call the Click API. Create Click API client
  //ds-snippet-start:Click3Step2
  const dsApiClient = new docusignClick.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  //ds-snippet-end
  //ds-snippet-start:Click3Step4
  const accountApi = new docusignClick.AccountsApi(dsApiClient);

  // Create a new clickwrap version using SDK
  const result = await accountApi.createClickwrapVersion(
    args.accountId,
    args.clickwrapId,
    { clickwrapRequest }
  );
  //ds-snippet-end
  console.log(
    `New clickwrap version was created. ClickwrapId ${result.clickwrapId}`
  );
  return result;
};

module.exports = { createNewClickwrapVersion };
