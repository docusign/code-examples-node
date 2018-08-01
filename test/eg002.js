// Test for eg002

// See https://mochajs.org/
const chai = require('chai')
    , expect = chai.expect
    , should = chai.should()
    , fs = require('fs')
    , path = require('path')
    , helpers = require('./testHelpers')
    , eg002 = require('../lib/examples/eg002')
    ;

describe ('eg002 (test takes a long time)', function(){
  it('create envelope should work', async function(){
    this.timeout(30000); // 30 sec allows for the envelope to be created

    let envelopeArgs = {
            signerEmail: helpers.signerEmail, 
            signerName: helpers.signerName, 
            ccEmail: helpers.ccEmail, 
            ccName: helpers.ccName, 
        }
      , args = {
            dsAPIclient: helpers.dsAPIclient,
            makePromise: helpers.makePromise, // this is a function
            accountId: helpers.accountId,
            envelopeArgs: envelopeArgs
        }
    ;

    try {
      let results = await eg002.worker(args);
      let worked = results.envelopeId.length > 10;
      expect(worked).to.equal(true);
    } 
    catch (error) {helpers.catchMethod(error)}
  })
})
