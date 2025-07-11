/**
 * @file
 * Example 001: List agreements
 * @author DocuSign
 */

const iam = require('@docusign/iam-sdk');

const listAgreements = async (args) => {
  const client = new iam.IamClient({ accessToken: args.accessToken });
  return await client.navigator.agreements.getAgreementsList({ accountId: args.accountId });
};

module.exports = { listAgreements };
