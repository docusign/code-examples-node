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
     title: documentArgs.jobTitle,
     date: documentArgs.date,
    },
  });


   // Step 4. Call the Click API
   const dsApiClient = new docusignClick.ApiClient();
   dsApiClient.setBasePath(args.basePath);
   dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
   const accountApi = new docusignClick.AccountsApi(dsApiClient);

   // Embed the clickwrap
   const result = await accountApi.createHasAgreed(
    args.accountId, args.clickwrapId, {
      userAgreementRequest: userAgreement
    });
   console.log(`See the embedded clickwrap on this page:`);
   return result;
 };

 module.exports = { embedClickwrap };
 