/**
 * @file
 * Example 6: Embed a clickwrap
 * @author DocuSign
 */

 const fs = require("fs-extra");
 const docusignClick = require("docusign-click");
 
 /**
 * Work with creating of the clickwrap
 * @param {Object} args Arguments for embedding a clickwrap
 * @param {string} args.accessToken The access token
 * @param {string} args.basePath The API base path URL
 * @param {string} args.documentArgs.fullName The email of first signer
 * @param {string} args.documentArgs.email The name of first signer
 * @param {string} args.documentArgs.company The email of second signer
 * @param {string} args.documentArgs.jobTitle The name of second signer
 * @param {string} args.documentArgs.date The email of cc recipient
 */
 const embedClickwrap = async (args) => {
   // Step 3. Construct the request Body
   // Create display settings model
  //  const displaySettings = docusignClick.DisplaySettings.constructFromObject({
  //    consentButtonText: "I Agree",
  //    displayName: "Terms of Service",
  //    downloadable: true,
  //    format: "modal",
  //    hasAccept: true,
  //    mustRead: true,
  //    requireAccept: true,
  //    documentDisplay: "document",
  //   //  fullName: args.fullName,
  //   //  email: args.email,
  //   //  company: args.company,
  //   //  title: args.title,
  //   //  date: args.date,
  //  });
 
   // Create document model
   // Read and encode file. Put encoded value to Document entity.
   // The reads could raise an exception if the file is not available!
  //  const documentPdfExample = fs.readFileSync(args.docFile);
  //  const encodedExampleDocument =
  //    Buffer.from(documentPdfExample).toString("base64");
  //  const document = docusignClick.Document.constructFromObject({
  //    documentBase64: encodedExampleDocument,
  //    documentName: "Terms of Service",
  //    fileExtension: "pdf",
  //   //  fullName: args.fullName,
  //   //  email: args.email,
  //   //  company: args.company,
  //   //  title: args.title,
  //   //  date: args.date,
  //    order: 0,
     
  //  });
 
   // Create clickwrapRequest model
  //  const clickwrapRequest = docusignClick.ClickwrapRequest.constructFromObject({
  //   displaySettings,
  //   documents: [document],
  //   name: args.clickwrapName,
  //   requireReacceptance: true,
  // });

  const documentArgs = {
    fullName: args.documentArgs.fullName,
    email: args.documentArgs.email,
    company: args.documentArgs.company,
    jobTitle: args.documentArgs.jobTitle,
    date: args.documentArgs.date,
 };

 console.log(documentArgs);

   const userAgreement = new docusignClick.UserAgreementRequest.constructFromObject({
    clientUserId: documentArgs.email,
    documentData: {
     fullName: documentArgs.fullName,
     email: documentArgs.email,
     company: documentArgs.company,
     jobTitle: documentArgs.jobTitle,
     date: documentArgs.date,
    },
   //  requireReacceptance: true,
  });

 
   // Step 4. Call the Click API
   const dsApiClient = new docusignClick.ApiClient();
   dsApiClient.setBasePath(args.basePath);
   dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
   const accountApi = new docusignClick.AccountsApi(dsApiClient);
 
   // Embed the clickwrap
   const result = await accountApi.createHasAgreed(
    args.accountId, args.clickwrapId, {
     userAgreement, 
   });
   console.log(`See the embedded clickwrap in the dialog box.`);
   return result;
 };
 
 module.exports = { embedClickwrap };
 