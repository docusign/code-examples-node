/**
 * @file
 * Example 028: Create new brand
 * @author DocuSign
 */

const docusign = require("docusign-esign");

/**
 * This function does the work of creating the brand
 */
const createBrand = async (args) => {
  // Construct your API headers
  //ds-snippet-start:eSign28Step2
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  let accountsApi = new docusign.AccountsApi(dsApiClient);
  //ds-snippet-end:eSign28Step2

  // Construct the request body
  //ds-snippet-start:eSign28Step3
  let callback = {
    brand: {
      brandName: args.brandName,
      defaultBrandLanguage: args.defaultBrandLanguage,
    },
  };
  //ds-snippet-end:eSign28Step3

  // Call the eSignature REST API
  //ds-snippet-start:eSign28Step4
  results = await accountsApi.createBrand(args.accountId, callback);
  return results;
  //ds-snippet-end:eSign28Step4
};

module.exports = { createBrand };
