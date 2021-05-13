/**
 * @file
 * Example 028: Create new brand
 * @author DocuSign
 */

const docusign = require("docusign-esign");

const createBrand = exports;

/**
 * This function does the work of creating the brand
 */
createBrand.createBrand = async (args) => {
  // Step 1. Construct your API headers
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  let accountsApi = new docusign.AccountsApi(dsApiClient);

  // Step 2. Construct the request body
  let callback = {
    brand: {
      brandName: args.brandName,
      defaultBrandLanguage: args.defaultBrandLanguage,
    },
  };

  // Step 3. Call the eSignature REST API
  results = await accountsApi.createBrand(args.accountId, callback);
  return results;
};
