const settings = require('../config/appsettings.json');
const chai = require('chai');
const chaiExclude = require('chai-exclude');
const expect = chai.expect;
const should = chai.should();
const { sendEnvelopeForEmbeddedSigning, makeEnvelope: makeEnvelopeForEmbeddedSigning, makeRecipientViewRequest } = require('../embeddedSigning');
const { sendEnvelope, makeEnvelope: makeEnvelopeForSigningViaEmail, document1 } = require('../lib/eSignature/examples/signingViaEmail')
const fs = require('fs');
const path = require('path');
const { authenticate } = require('./testHelpers');
const { signerClientId, pingUrl, returnUrl, TEST_PDF_FILE, TEST_DOCX_FILE, BASE_PATH } = require('./constants')

chai.use(chaiExclude);

let ACCOUNT_ID;
let ACCESS_TOKEN;

describe ('envelopeTests', function() {
  before(async function() {
    this.timeout(0);

    const { accountId, accessToken } = await authenticate();
      
    ACCOUNT_ID = accountId;
    ACCESS_TOKEN = accessToken;
  });

  it('embeddedSigning', async function() {
    this.timeout(0);

    const envelopeArgs = {
      signerEmail: settings.signerEmail,
      signerName: settings.signerName,
      signerClientId: signerClientId,
      dsReturnUrl: returnUrl,
      dsPingUrl: pingUrl,
      docFile: path.resolve(TEST_PDF_FILE),
    };
    const args = {
      accessToken: ACCESS_TOKEN,
      basePath: BASE_PATH,
      accountId: ACCOUNT_ID,
      envelopeArgs: envelopeArgs,
    };

    const { envelopeId, redirectUrl } = await sendEnvelopeForEmbeddedSigning(args);

    should.exist(envelopeId);
    should.exist(redirectUrl);
  });

  it('embeddedSigning_makeEnvelope', async function() {
    this.timeout(0);

    const envelopeArgs = {
      signerEmail: settings.signerEmail,
      signerName: settings.signerName,
      signerClientId: signerClientId,
      dsReturnUrl: returnUrl,
      dsPingUrl: pingUrl,
      docFile: path.resolve(TEST_PDF_FILE),
    };

    const expected = {
      emailSubject: "Please sign this document",
      recipients: {
        signers: [
          {
            email: settings.signerEmail,
            name: settings.signerName,
            clientUserId: signerClientId,
            recipientId: '1',
            tabs: {
              signHereTabs: [
                {
                  anchorString: "/sn1/",
                  anchorYOffset: "10",
                  anchorUnits: "pixels",
                  anchorXOffset: "20"
                }
              ]
            }
          }
        ]
      },
      status: 'sent'
    };

    const envelope = await makeEnvelopeForEmbeddedSigning(envelopeArgs);

    should.exist(envelope);
    expect(envelope).excluding('documents').to.deep.equal(expected);
  });

  it('embeddedSigning_makeRecipientView', async function() {
    this.timeout(0);

    const envelopeArgs = {
      signerEmail: settings.signerEmail,
      signerName: settings.signerName,
      signerClientId: signerClientId,
      dsReturnUrl: returnUrl,
      dsPingUrl: pingUrl,
    };

    const expected = {
      returnUrl: `${returnUrl}?state=123`,
      authenticationMethod: 'none',
      email: settings.signerEmail,
      userName: settings.signerName,
      clientUserId: signerClientId,
      pingFrequency: 600,
      pingUrl: pingUrl
    };

    const viewRequest = await makeRecipientViewRequest(envelopeArgs);

    should.exist(viewRequest);
    // expect(JSON.stringify(expected)).to.be.equal(JSON.stringify(viewRequest));
    expect({...viewRequest}).to.deep.equal({...expected});
  });

  it('signViaEmail', async function() {
    this.timeout(0);

    const envelopeArgs = {
      signerEmail: settings.signerEmail,
      signerName: settings.signerName,
      ccEmail: 'test@mail.com',
      ccName: 'Test Name',
      status: 'sent',
      doc2File: path.resolve(TEST_DOCX_FILE),
      doc3File: path.resolve(TEST_PDF_FILE),
    };
    const args = {
      accessToken: ACCESS_TOKEN,
      basePath: BASE_PATH,
      accountId: ACCOUNT_ID,
      envelopeArgs: envelopeArgs,
    };

    const { envelopeId } = await sendEnvelope(args);

    should.exist(envelopeId);
  });

  it('signViaEmail_makeEnvelope', async function() {
    this.timeout(0);

    const envelopeArgs = {
      signerEmail: settings.signerEmail,
      signerName: settings.signerName,
      ccEmail: 'test@mail.com',
      ccName: 'Test Name',
      status: 'sent',
      doc2File: path.resolve(TEST_DOCX_FILE),
      doc3File: path.resolve(TEST_PDF_FILE),
    };

    const expected = {
      emailSubject: "Please sign this document set",
      recipients: {
        signers: [
          {
            email: settings.signerEmail,
            name: settings.signerName,
            recipientId: '1',
            routingOrder: '1',
            tabs: {
              signHereTabs: [
                {
                  anchorString: "**signature_1**",
                  anchorYOffset: "10",
                  anchorUnits: "pixels",
                  anchorXOffset: "20",
                },
                {
                  anchorString: "/sn1/",
                  anchorYOffset: "10",
                  anchorUnits: "pixels",
                  anchorXOffset: "20",
                }
              ]
            }
          }
        ],
        carbonCopies: [
          {
            email: 'test@mail.com',
            name: 'Test Name',
            routingOrder: '2',
            recipientId: '2'
          }
        ]
      },
      status: 'sent'
    };

    const envelope = await makeEnvelopeForSigningViaEmail(envelopeArgs);

    should.exist(envelope);
    expect(envelope).excluding('documents').to.deep.equal(expected);
  });

  it('signViaEmail_document1', async function() {
    this.timeout(0);

    const envelopeArgs = {
      signerEmail: settings.signerEmail,
      signerName: settings.signerName,
      ccEmail: 'test@mail.com',
      ccName: 'Test Name',
    };

    const expected = `
    <!DOCTYPE html>
    <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family:sans-serif;margin-left:2em;">
        <h1 style="font-family: 'Trebuchet MS', Helvetica, sans-serif;
            color: darkblue;margin-bottom: 0;">World Wide Corp</h1>
        <h2 style="font-family: 'Trebuchet MS', Helvetica, sans-serif;
          margin-top: 0px;margin-bottom: 3.5em;font-size: 1em;
          color: darkblue;">Order Processing Division</h2>
        <h4>Ordered by ${settings.signerName}</h4>
        <p style="margin-top:0em; margin-bottom:0em;">Email: ${settings.signerEmail}</p>
        <p style="margin-top:0em; margin-bottom:0em;">Copy to: ${'Test Name'}, ${'test@mail.com'}</p>
        <p style="margin-top:3em;">
  Candy bonbon pastry jujubes lollipop wafer biscuit biscuit. Topping brownie sesame snaps sweet roll pie. Croissant danish biscuit soufflé caramels jujubes jelly. Dragée danish caramels lemon drops dragée. Gummi bears cupcake biscuit tiramisu sugar plum pastry. Dragée gummies applicake pudding liquorice. Donut jujubes oat cake jelly-o. Dessert bear claw chocolate cake gummies lollipop sugar plum ice cream gummies cheesecake.
        </p>
        <!-- Note the anchor tag for the signature field is in white. -->
        <h3 style="margin-top:3em;">Agreed: <span style="color:white;">**signature_1**/</span></h3>
        </body>
    </html>
  `;

    const document = await document1(envelopeArgs);

    should.exist(document);
    expect(document).to.contain(settings.signerEmail);
    expect(document).to.contain(settings.signerName);
    expect(document).to.contain('test@mail.com');
    expect(document).to.contain('Test Name');
    expect(document).to.be.equal(expected);
  });

})
