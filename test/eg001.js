// Test for eg001
const settings = require('../config/appsettings.json');

// See https://mochajs.org/
const chai = require('chai')
    , expect = chai.expect
    , helpers = require('./testHelpers')
    , eg001 = require('../eg001EmbeddedSigning')
    ;

describe ('eg001', function(){
  it('create envelope and embedded signing URL should work', async function(){
    this.timeout(30000); // 30 sec allows for the envelope to be created

    let envelopeArgs = {
            signerEmail: helpers.signerEmail, 
            signerName: helpers.signerName, 
            signerClientId: helpers.signerClientId,
            dsReturnUrl: settings.appUrl + '/ds-return',
            dsPingUrl: settings.appUrl + '/'
        }
      , args = {
            accessToken: helpers.accessToken,
            basePath: helpers.basePath,
            accountId: helpers.accountId,
            envelopeArgs: envelopeArgs
        }
    ;

    let results = null;
    try {results = await eg001.worker(args)} 
    catch (error) {helpers.catchMethod(error)};
    
    // eg redirectUrl = https://demo.docusign.net/Signing/StartInSession.aspx?t=914f97b8-xxxx-xxxx-xxxx-391513e9e780
    let worked = results && 
      results.redirectUrl.indexOf('.docusign.net/Signing') > 0 && 
      results.envelopeId.length > 10;
    expect(worked).to.equal(true);
  })
})
