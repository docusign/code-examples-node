/**
 * @file
 * Example 5: Get elastic template responses
 * @author DocuSign
 */

const docusignClick = require('docusign-click');

/**
 * Get elastic template responses using SDK
 * @param {Object} args Arguments for creating elastic template
 * @return {Object} The object with value of clickwrapId or error
 */
const getClickwrapAgreements = async (args) => {
  // Call the Click API. Create click API client
  //ds-snippet-start:Click5Step2
  const dsApiClient = new docusignClick.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  //ds-snippet-end
  //ds-snippet-start:Click5Step3
  const accountApi = new docusignClick.AccountsApi(dsApiClient);

  const options = {
    status: 'agreed'
  };

  // Get elastic template responses using SDK
  const result = await new Promise((resolve, reject) => {
      accountApi.getClickwrapAgreements(
        args.accountId,
        args.clickwrapId,
        options, (err, data, response) => {
            if (err) return reject(err);
            resolve({ data, response });
          });
        });

    const headers = result.response.headers;
    const remaining = headers['x-ratelimit-remaining'];
    const reset = headers['x-ratelimit-reset'];

    if (remaining && reset) {
      const resetInstant = new Date(Number(reset) * 1000);
      console.log(`API calls remaining: ${remaining}`);
      console.log(`Next Reset: ${resetInstant.toISOString()}`);
    }

  return result.data;
  //ds-snippet-end
};

module.exports = { getClickwrapAgreements };
