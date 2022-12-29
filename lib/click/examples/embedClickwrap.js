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
 * @param {string} args.documentArgs.fullName
 * @param {string} args.documentArgs.email 
 * @param {string} args.documentArgs.company
 * @param {string} args.documentArgs.jobTitle
 * @param {string} args.documentArgs.date
 */
 
  const embedClickwrap = async (args) => {
 
   const documentArgs = {
     fullName: args.documentArgs.fullName,
     email: args.documentArgs.email,
     company: args.documentArgs.company,
     jobTitle: args.documentArgs.jobTitle,
     date: args.documentArgs.date,
   };
 
   const userAgreement = new docusignClick.UserAgreementRequest.constructFromObject({
     clientUserId: documentArgs.email,
     documentData: {
      fullName: documentArgs.fullName,
      email: documentArgs.email,
      company: documentArgs.company,
      title: documentArgs.jobTitle,
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
       userAgreementRequest: userAgreement
     });
    console.log(`See the embedded clickwrap in the dialog box.`);
    return result;
  };

 const getActiveClickwraps = async (args) => {
  // Call the Click API
  // Create Click API client
  const dsApiClient = new docusignClick.ApiClient();
  dsApiClient.setBasePath(args.basePath)
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  const accountApi = new docusignClick.AccountsApi(dsApiClient);

  // Get a list of inactive clickwraps
  return await accountApi.getClickwraps(args.accountId, {status: 'active'});
}

const getInactiveClickwraps = async (args) => {
  // Call the Click API
  // Create Click API client
  const dsApiClient = new docusignClick.ApiClient();
  dsApiClient.setBasePath(args.basePath)
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  const accountApi = new docusignClick.AccountsApi(dsApiClient);

  // Get a list of inactive clickwraps
  return await accountApi.getClickwraps(args.accountId, {status: 'inactive'});
}

module.exports = { getInactiveClickwraps, getActiveClickwraps, embedClickwrap };

