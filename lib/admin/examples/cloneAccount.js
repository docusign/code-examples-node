const docusignAdmin = require('docusign-admin');

/**
 * This function clones an account
 * @param {object} args parameters for account cloning
 * @returns {docusignAdmin.AssetGroupAccountClone} Summary of cloning an account
 */
const cloneAccount = async(args) => {
  //ds-snippet-start:Admin12Step2
  const apiClient = new docusignAdmin.ApiClient();
  apiClient.setBasePath(args.basePath);
  apiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  //ds-snippet-end:Admin12Step2

  //ds-snippet-start:Admin12Step4
  const accountData = docusignAdmin.AssetGroupAccountClone.constructFromObject({
    sourceAccount: {
      id: args.sourceAccountId,
    },
    targetAccount: {
      name: args.targetAccountName,
      admin: {
        firstName: args.targetAccountFirstName,
        lastName: args.targetAccountLastName,
        email: args.targetAccountEmail,
      },
      countryCode: 'US',
    }
  });
  //ds-snippet-end:Admin12Step4

  //ds-snippet-start:Admin12Step5
  const assetGroupApi = new docusignAdmin.ProvisionAssetGroupApi(apiClient);
  return assetGroupApi.cloneAssetGroupAccount(accountData, args.organizationId);
  //ds-snippet-end:Admin12Step5
}

/**
 * Get list of asset group accounts for an organization
 * @param {object} args parameters for getting the accounts
 * @returns {docusignAdmin.AssetGroupAccountsResponse} Asset group accounts information
 */
const getAccounts = async(args) => {
  const apiClient = new docusignAdmin.ApiClient();
  apiClient.setBasePath(args.basePath);
  apiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);

  //ds-snippet-start:Admin12Step3
  const assetGroupApi = new docusignAdmin.ProvisionAssetGroupApi(apiClient);
  const options = {
    compliant: true,
  };
  const accounts = await assetGroupApi.getAssetGroupAccounts(args.organizationId, options);
  //ds-snippet-end:Admin12Step3

  return accounts;
}

module.exports = { cloneAccount, getAccounts };
