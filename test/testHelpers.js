// Test helpers

// See https://mochajs.org/
const helpers = exports;
const {promisify} = require('util') // http://2ality.com/2017/05/util-promisify.html
    , docusign = require('docusign-esign');

helpers.accessToken =  process.env.DS_TEST_ACCESS_TOKEN; // An access token
helpers.accountId = process.env.DS_TEST_ACCOUNT_ID;
helpers.basePath = 'https://demo.docusign.net/restapi';
helpers.signerEmail = 'ds_test@mailinator.com';
helpers.signerName = 'Mocha Tester';
helpers.ccEmail = 'ds_test_cc@mailinator.com';
helpers.ccName = 'Mocha CC Tester';
helpers.signerClientId = 1000;

helpers.dsAPIclient = new docusign.ApiClient();
helpers.dsAPIclient.addDefaultHeader('Authorization', 'Bearer ' + helpers.accessToken);
helpers.dsAPIclient.setBasePath(helpers.basePath);

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
