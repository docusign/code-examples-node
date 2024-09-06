const docusignAdmin = require('docusign-admin');

/**
 * This function creates an account
 * @param {object} args parameters for account creation
 * @returns {docusignAdmin.SubscriptionProvisionModelAssetGroupWorkResult} Summary of creating an account
 */
const createAccount = async (args) => {
  //ds-snippet-start:Admin13Step2
  const apiClient = new docusignAdmin.ApiClient();
  apiClient.setBasePath(args.basePath);
  apiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  //ds-snippet-end:Admin13Step2

  //ds-snippet-start:Admin13Step4
  const accountData = docusignAdmin.SubAccountCreateRequest.constructFromObject({
    subscriptionDetails: docusignAdmin.SubAccountCreateRequestSubAccountCreationSubscription.constructFromObject({
      id: args.subscriptionId,
      planId: args.planId,
      modules: [],
    }),
    targetAccount: docusignAdmin.SubAccountCreateRequestSubAccountCreationTargetAccountDetails.constructFromObject({
      name: 'CreatedThroughAPI',
      countryCode: 'US',
      admin: docusignAdmin.SubAccountCreateRequestSubAccountCreationTargetAccountAdmin.constructFromObject({
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        locale: 'en',
      }),
    }),
  });
  //ds-snippet-end:Admin13Step4

  //ds-snippet-start:Admin13Step5
  const assetGroupApi = new docusignAdmin.ProvisionAssetGroupApi(apiClient);
  return assetGroupApi.createAssetGroupAccount(accountData, args.organizationId);
  //ds-snippet-end:Admin13Step5
};

/**
 * Get all plan items and return the first
 * @param {object} args parameters for getting the plan items
 * @returns {docusignAdmin.OrganizationSubscriptionResponse} Plan item data
 */
const getOrganizationPlanItem = async (args) => {
  const apiClient = new docusignAdmin.ApiClient();
  apiClient.setBasePath(args.basePath);
  apiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);

  //ds-snippet-start:Admin13Step3
  const assetGroupApi = new docusignAdmin.ProvisionAssetGroupApi(apiClient);
  const planItems = await assetGroupApi.getOrganizationPlanItems(args.organizationId);
  //ds-snippet-end:Admin13Step3

  return planItems[0];
};

module.exports = { createAccount, getOrganizationPlanItem };
