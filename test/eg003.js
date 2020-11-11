// Test for eg003

// See https://mochajs.org/
const chai = require('chai')
    , expect = chai.expect
    , helpers = require('./testHelpers')
    , eg003 = require('../lib/eSignature/eg003ListEnvelopes')
    ;

describe ('eg003', function(){
  it('query DocuSign to list envelopes sent by the user', async function(){
    this.timeout(30000); // 30 sec allows for the envelope to be created

    let args = {
            accessToken: helpers.accessToken,
            basePath: helpers.basePath,
            accountId: helpers.accountId,
        }
    ;

    let results = null;
    try {results = await eg003.worker(args)} 
    catch (error) {helpers.catchMethod(error)};
    let worked = results && results.endPosition && results.startPosition
        &&results.totalSetSize > 0;
    expect(worked).to.equal(true);
    expect(results.envelopes).to.be.an('array');
    expect(results.nextUri).to.exist;
    expect(results.previousUri).to.exist;
  })
})
