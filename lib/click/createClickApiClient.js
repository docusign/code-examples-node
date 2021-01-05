const docusignClick = require("docusign-click")


const createClickApiClient = (args, clickApiUrl) => {
    //Step 2. Construct your API headers
    const dsApiClient = new docusignClick.ApiClient();
    dsApiClient.setBasePath(clickApiUrl);
    dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
    return new docusignClick.AccountsApi(dsApiClient);
}

module.exports = createClickApiClient;