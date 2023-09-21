/**
 * @file
 * Example 030: Apply Brand to Template
 * @author DocuSign
 */

const docusign = require('docusign-esign');

/**
 * This function does the work of creating the envelope
 */
const applyBrandToTemplate = async (args) => {
  // Step 1. Construct your API headers
  //ds-snippet-start:eSign30Step2
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  let envelopesApi = new docusign.EnvelopesApi(dsApiClient);
  //ds-snippet-end:eSign30Step2

  // Step 2. Construct your request body
  //ds-snippet-start:eSign30Step3
  const envDef = {
    envelopeDefinition: {
      templateId: args.templateId,
      brandId: args.brandId,
      templateRoles: args.templateRoles,
      status: 'sent',
    },
  };
  //ds-snippet-end:eSign30Step3

  // Step 3. Call the eSignature REST API
  //ds-snippet-start:eSign30Step4
  let results = await envelopesApi.createEnvelope(args.accountId, envDef);
  //ds-snippet-end:eSign30Step4
  return results;
};

/**
 * Form page for this application
 */
const getBrands = async (args) => {
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);

  let brandApi = new docusign.AccountsApi(dsApiClient);
  brandsResponse = await brandApi.listBrands(args.accountId);

  return brandsResponse;
};

module.exports = { applyBrandToTemplate, getBrands };
