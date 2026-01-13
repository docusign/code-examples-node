/**
 * @file
 * Example 4: Get list of elastic templates
 * @author DocuSign
 */

const docusignClick = require('docusign-click');

/**
 * Get list of elastic templates
 * @param {Object} args Arguments for creating elastic templates
 * @return {Object} The object with value of clickwrapId or error
 */
const getClickwraps = async (args) => {
  // Call the Click API. Create Click API client
  //ds-snippet-start:Click4Step2
  const dsApiClient = new docusignClick.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  //ds-snippet-end
  //ds-snippet-start:Click4Step3
  const accountApi = new docusignClick.AccountsApi(dsApiClient);

  // Get a list of all elastic templates
  const result = await new Promise((resolve, reject) => {
      accountApi.getClickwraps(args.accountId,
      (err, data, response) => {
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
};
  //ds-snippet-end

module.exports = { getClickwraps };
