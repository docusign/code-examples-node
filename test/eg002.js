// Test for eg002

// See https://mochajs.org/
const chai = require('chai')
    , expect = chai.expect
    , helpers = require('./testHelpers')
    , eg002 = require('../lib/eSignature/eg002SigningViaEmail')
    ;

describe ('eg002 (test takes a long time to create an envelope with 3 documents)', function(){
  it('create envelope with 3 documents should work', async function(){
    this.timeout(30000); // 30 sec allows for the envelope to be created

    let envelopeArgs = {
            signerEmail: helpers.signerEmail, 
            signerName: helpers.signerName, 
            ccEmail: helpers.ccEmail, 
            ccName: helpers.ccName, 
            status: "sent"
        }
      , args = {
            accessToken: helpers.accessToken,
            basePath: helpers.basePath,
            accountId: helpers.accountId,
            envelopeArgs: envelopeArgs
        }
    ;

    let results = null;
    try {results = await eg002.worker(args)} 
    catch (error) {helpers.catchMethod(error)};
    
    let worked = results && results.envelopeId.length > 10;
    expect(worked).to.equal(true);
  })
})
