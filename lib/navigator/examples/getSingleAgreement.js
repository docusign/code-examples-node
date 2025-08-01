/**
 * @file
 * Example 002: Get a single agreement
 * @author DocuSign
 */

const iam = require('@docusign/iam-sdk');

const listAgreements = async (args) => {
//ds-snippet-start:Navigator2Step2
  const client = new iam.IamClient({ accessToken: args.accessToken });
//ds-snippet-end:Navigator2Step2
  return await client.navigator.agreements.getAgreementsList({ accountId: args.accountId });
};

//ds-snippet-start:Navigator2Step3
const getAgreement = async (args) => {
  const client = new iam.IamClient({ accessToken: args.accessToken, serverURL: args.basePath });
  return await client.navigator.agreements.getAgreement({ accountId: args.accountId, agreementId: args.agreementId });
};

module.exports = { listAgreements, getAgreement };
//ds-snippet-end:Navigator2Step3