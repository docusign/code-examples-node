/**
 * @file
 * Example 024: Creating a permission profile
 * @author DocuSign
 */

const docusign = require("docusign-esign");

/**
 * This function does the work of creating the permission profile
 */
const createPermission = async (args) => {
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);

  // Step 1. Construct your API headers
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  let accountsApi = new docusign.AccountsApi(dsApiClient);

  // Step 2: Construct the request body
  const requestBody = {
    permissionProfile: {
      permissionProfileName: args.profileName,
      settings: {
        useNewDocuSignExperienceInterface: 0,
        allowBulkSending: "true",
        allowEnvelopeSending: "true",
        allowSignerAttachments: "true",
        allowTaggingInSendAndCorrect: "true",
        allowWetSigningOverride: "true",
        allowedAddressBookAccess: "personalAndShared",
        allowedTemplateAccess: "share",
        enableRecipientViewingNotifications: "true",
        enableSequentialSigningInterface: "true",
        receiveCompletedSelfSignedDocumentsAsEmailLinks: "false",
        signingUiVersion: "v2",
        useNewSendingInterface: "true",
        allowApiAccess: "true",
        allowApiAccessToAccount: "true",
        allowApiSendingOnBehalfOfOthers: "true",
        allowApiSequentialSigning: "true",
        enableApiRequestLogging: "true",
        allowDocuSignDesktopClient: "false",
        allowSendersToSetRecipientEmailLanguage: "true",
        allowVaulting: "false",
        allowedToBeEnvelopeTransferRecipient: "true",
        enableTransactionPointIntegration: "false",
        powerFormRole: "admin",
        vaultingMode: "none",
      },
    },
  };

  let results = await accountsApi.createPermissionProfile(
    args.accountId,
    requestBody
  );

  return results;
};

module.exports = { createPermission };
