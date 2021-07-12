/**
 * @file
 * Example 003: List envelopes in the user's account
 * @author DocuSign
 */

const docusign = require("docusign-esign");
const moment = require("moment");

/**
 * This function does the work of listing the envelopes
 */
const listEnvelope = async (args) => {
  // Data for this method
  // args.basePath
  // args.accessToken
  // args.accountId

  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  let envelopesApi = new docusign.EnvelopesApi(dsApiClient),
    results = null;

  // Step 1. List the envelopes
  // The Envelopes::listStatusChanges method has many options
  // See https://developers.docusign.com/docs/esign-rest-api/reference/envelopes/envelopes/liststatuschanges/

  // The list status changes call requires at least a from_date OR
  // a set of envelopeIds. Here we filter using a from_date.
  // Here we set the from_date to filter envelopes for the last month
  // Use ISO 8601 date format
  let options = { fromDate: moment().subtract(30, "days").format() };

  // Exceptions will be caught by the calling function
  results = await envelopesApi.listStatusChanges(args.accountId, options);
  return results;
};

module.exports = { listEnvelope };
