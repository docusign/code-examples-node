// Test for eg001

// See https://mochajs.org/
const chai = require('chai')
    , expect = chai.expect
    , should = chai.should()
    , fs = require('fs')
    , docusign = require('docusign-esign')
    , path = require('path')
    , {promisify} = require('util') // http://2ality.com/2017/05/util-promisify.html
    , eg001 = require('../lib/examples/eg001')
    ;

const accessToken =  process.env.DS_TEST_ACCESS_TOKEN // An access token
    , accountId = process.env.DS_TEST_ACCOUNT_ID
    , basePath = 'https://demo.docusign.net/restapi'
    , signerEmail = 'ds_test@mailinator.com'
    , signerName = 'Mocha Tester'
    , signerClientId = 1000
    ;

const makePromise = function _makePromise(obj, methodName){
    let promiseName = methodName + '_promise';
    if (!(promiseName in obj)) {
      obj[promiseName] = promisify(obj[methodName]).bind(obj)
    }
    return obj[promiseName]
}

describe ('eg001', function(){
  it('create envelope and Signing Ceremony URL should work', async function(){
    this.timeout(30000); // 30 sec allows for the envelope to be created

    const dsAPIclient = new docusign.ApiClient();
    dsAPIclient.addDefaultHeader('Authorization', 'Bearer ' + accessToken);
    dsAPIclient.setBasePath(basePath);

    let envelopeArgs = {
            signerEmail: signerEmail, 
            signerName: signerName, 
            signerClientId: signerClientId
        }
      , args = {
            dsAPIclient: dsAPIclient,
            makePromise: makePromise, // this is a function
            accountId: accountId,
            envelopeArgs: envelopeArgs
        }
    ;

    try {
      let results = await eg001.worker(args);
      let worked = results.redirectUrl && results.envelopeId.length > 10;
      expect(worked).to.equal(true);
    } 
    catch (error) {
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
        console.log `err: ${error}, errorCode: ${errorCode}, errorMessage: ${errorMessage}`;
    
      throw error; // an unexpected error has occured
    }
  })
})
