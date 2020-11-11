// Test helpers

// See https://mochajs.org/
const helpers = exports;
const settings = require('../config/appsettings.json');

helpers.accessToken = process.env.DS_TEST_ACCESS_TOKEN; // An access token
helpers.accountId = process.env.DS_TEST_ACCOUNT_ID; //An API Account ID
helpers.basePath = 'https://demo.docusign.net/restapi';
helpers.signerEmail = settings.signerEmail || process.env.DS_TEST_SIGNER_EMAIL;
helpers.signerName = settings.signerName || process.env.DS_TEST_SIGNER_NAME;
helpers.ccEmail = process.env.DS_TEST_CC_EMAIL;
helpers.ccName = process.env.DS_TEST_CC_NAME;

helpers.catchMethod = (error) => {
    // This catch statement provides more info on an API problem.
    // To debug mocha:
    // npm test -- --inspect --debug-brk
    let errorBody = error && error.response && error.response.body
        // we can pull the DocuSign error code and message from the response body
        , errorCode = errorBody && errorBody.errorCode
        , errorMessage = errorBody && errorBody.message
        ;
    // In production, may want to provide customized error messages and 
    // remediation advice to the user.
    console.log (`err: ${error}, errorCode: ${errorCode}, errorMessage: ${errorMessage}`);

    //throw error; // an unexpected error has occured
}
