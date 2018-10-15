// Test for eg001

// See https://mochajs.org/
const chai = require('chai')
    , expect = chai.expect
    , should = chai.should()
    , fs = require('fs')
    , path = require('path')
    , helpers = require('./testHelpers')
    , eg001 = require('../lib/examples/eg001EmbeddedSigning')
    ;

describe ('eg001', function(){
  it('create envelope and Signing Ceremony URL should work', async function(){
    this.timeout(30000); // 30 sec allows for the envelope to be created

    let envelopeArgs = {
            signerEmail: helpers.signerEmail, 
            signerName: helpers.signerName, 
            signerClientId: helpers.signerClientId,
            dsReturnUrl: "http://example.com",
            dsPingUrl: "http://example.com"
        }
      , args = {
            dsAPIclient: helpers.dsAPIclient,
            makePromise: helpers.makePromise, // this is a function
            accountId: helpers.accountId,
            envelopeArgs: envelopeArgs
        }
    ;

    let results = null;
    try {results = await eg001.worker(args)} 
    catch (error) {helpers.catchMethod(error)};
    
    // eg redirectUrl = https://demo.docusign.net/Signing/StartInSession.aspx?t=914f97b8-060a-421c-8794-391513e9e780
    let worked = results && 
      results.redirectUrl.indexOf('.docusign.net/Signing/StartInSession') > 0 && 
      results.envelopeId.length > 10;
    expect(worked).to.equal(true);
  })
})
