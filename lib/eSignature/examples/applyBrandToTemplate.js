/**
 * @file
 * Example 030: Apply Brand to Template
 * @author DocuSign
 */

const docusign = require('docusign-esign')

const applyBrandToTemplate = exports


applyBrandToTemplate.createEnvelope = async (args) => {
    // Step 1. Construct your API headers
    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(args.basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    let envelopesApi = new docusign.EnvelopesApi(dsApiClient);

    // Step 2. Construct your request body
    const envDef = {
        envelopeDefinition: {
            templateId: args.templateId,
            brandId: args.brandId,
            templateRoles: args.templateRoles,
            status: "sent"
        }
    };

    // Step 3. Call the eSignature REST API
    let results = await envelopesApi.createEnvelope(args.accountId, envDef)
    return results;
}

// ***DS.snippet.0.end

/**
 * Form page for this application
 */
applyBrandToTemplate.getBrandsAndTemplates = async (args) => {
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);

  let templatesApi = new docusign.TemplatesApi(dsApiClient)
  templatesResponse = await templatesApi.listTemplates(args.accountId);

  let brandApi = new docusign.AccountsApi(dsApiClient)
  brandsResponse = await brandApi.listBrands(args.accountId)

  return ({templatesResponse: templatesResponse, brandsResponse: brandsResponse});
}
