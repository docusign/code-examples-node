const fs = require('fs');
const path = require('path');
const chai = require('chai');
const chaiExclude = require('chai-exclude');
const expect = chai.expect;
const should = chai.should();

const {
  sendEnvelopeForEmbeddedSigning,
  makeEnvelope: makeEnvelopeForEmbeddedSigning,
  makeRecipientViewRequest
} = require('../embeddedSigning');
const {
  sendEnvelope,
  makeEnvelope: makeEnvelopeForSigningViaEmail,
  document1
} = require('../lib/eSignature/examples/signingViaEmail')
const { TEST_TIMEOUT_MS, authenticate, config } = require('./testHelpers');

const {
  signerClientId,
  pingUrl,
  returnUrl,
  TEST_PDF_FILE,
  TEST_DOCX_FILE,
  BASE_PATH,
  CC_EMAIL,
  CC_NAME
} = require('./constants')

chai.use(chaiExclude);

let ACCOUNT_ID;
let ACCESS_TOKEN;

describe ('EnvelopesApi tests:', function() {
  before(async function() {
    this.timeout(TEST_TIMEOUT_MS);

    const { accountId, accessToken } = await authenticate();
      
    should.exist(accountId);
    should.exist(accessToken);

    ACCOUNT_ID = accountId;
    ACCESS_TOKEN = accessToken;
  });

  it('sendEnvelopeForEmbeddedSigning method should create an envelope and a recipients view for the envelope if correct data is provided', async function() {
    this.timeout(TEST_TIMEOUT_MS);

    const envelopeArgs = {
      signerEmail: config.signerEmail,
      signerName: config.signerName,
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

  it('makeEnvelope method of embeddedSigning example should create the correct envelope definition if correct data is provided', async function() {
    this.timeout(TEST_TIMEOUT_MS);

    const envelopeArgs = {
      signerEmail: config.signerEmail,
      signerName: config.signerName,
      signerClientId: signerClientId,
      dsReturnUrl: returnUrl,
      dsPingUrl: pingUrl,
      docFile: path.resolve(TEST_PDF_FILE),
    };

    const expected = {
      emailSubject: "Please sign this document",
      documents: [
        {
          documentBase64: Buffer.from(fs.readFileSync(path.resolve(TEST_PDF_FILE))).toString("base64"),
          name: "Lorem Ipsum",
          fileExtension: "pdf",
          documentId: "3",
        }
      ],
      recipients: {
        signers: [
          {
            email: config.signerEmail,
            name: config.signerName,
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
    expect(envelope).excluding(['']).to.deep.equal(expected);
  });

  it('makeRecipientView method should create the correct recipient view request url if correct data is provided', async function() {
    this.timeout(TEST_TIMEOUT_MS);

    const envelopeArgs = {
      signerEmail: config.signerEmail,
      signerName: config.signerName,
      signerClientId: signerClientId,
      dsReturnUrl: returnUrl,
      dsPingUrl: pingUrl,
    };

    const expected = {
      returnUrl: `${returnUrl}?state=123`,
      authenticationMethod: 'none',
      email: config.signerEmail,
      userName: config.signerName,
      clientUserId: signerClientId,
      pingFrequency: 600,
      pingUrl: pingUrl
    };

    const viewRequest = await makeRecipientViewRequest(envelopeArgs);

    should.exist(viewRequest);
    expect({...viewRequest}).to.deep.equal({...expected});
  });

  it('signViaEmail method creates the envelope and sends it via email when correct data is provided', async function() {
    this.timeout(TEST_TIMEOUT_MS);

    const envelopeArgs = {
      signerEmail: config.signerEmail,
      signerName: config.signerName,
      ccEmail: CC_EMAIL,
      ccName: CC_NAME,
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

  it('makeEnvelope method of signViaEmail example should create the correct envelope definition if correct data is provided', async function() {
    this.timeout(TEST_TIMEOUT_MS);

    const document1Text = `
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
        <h4>Ordered by ${config.signerName}</h4>
        <p style="margin-top:0em; margin-bottom:0em;">Email: ${config.signerEmail}</p>
        <p style="margin-top:0em; margin-bottom:0em;">Copy to: ${CC_NAME}, ${CC_EMAIL}</p>
        <p style="margin-top:3em;">
  Candy bonbon pastry jujubes lollipop wafer biscuit biscuit. Topping brownie sesame snaps sweet roll pie. Croissant danish biscuit soufflé caramels jujubes jelly. Dragée danish caramels lemon drops dragée. Gummi bears cupcake biscuit tiramisu sugar plum pastry. Dragée gummies applicake pudding liquorice. Donut jujubes oat cake jelly-o. Dessert bear claw chocolate cake gummies lollipop sugar plum ice cream gummies cheesecake.
        </p>
        <!-- Note the anchor tag for the signature field is in white. -->
        <h3 style="margin-top:3em;">Agreed: <span style="color:white;">**signature_1**/</span></h3>
        </body>
    </html>
  `;

    const envelopeArgs = {
      signerEmail: config.signerEmail,
      signerName: config.signerName,
      ccEmail: CC_EMAIL,
      ccName: CC_NAME,
      status: 'sent',
      doc2File: path.resolve(TEST_DOCX_FILE),
      doc3File: path.resolve(TEST_PDF_FILE),
    };

    const expected = {
      emailSubject: "Please sign this document set",
      documents: [
        {
          documentBase64: Buffer.from(document1Text).toString("base64"),
          name: 'Order acknowledgement',
          fileExtension: 'html',
          documentId: '1',
        },
        {
          documentBase64: Buffer.from(fs.readFileSync(path.resolve(TEST_DOCX_FILE))).toString("base64"),
          name: "Battle Plan",
          fileExtension: "docx",
          documentId: "2",
        },
        {
          documentBase64: Buffer.from(fs.readFileSync(path.resolve(TEST_PDF_FILE))).toString("base64"),
          name: "Lorem Ipsum",
          fileExtension: "pdf",
          documentId: "3",
        }
      ],
      recipients: {
        signers: [
          {
            email: config.signerEmail,
            name: config.signerName,
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
            email: CC_EMAIL,
            name: CC_NAME,
            routingOrder: '2',
            recipientId: '2'
          }
        ]
      },
      status: 'sent'
    };

    const envelope = await makeEnvelopeForSigningViaEmail(envelopeArgs);

    should.exist(envelope);
    expect(envelope).excluding(['']).to.deep.equal(expected);
  });

  it('document1 should return correct html document if correct data is provided', async function() {
    this.timeout(TEST_TIMEOUT_MS);

    const envelopeArgs = {
      signerEmail: config.signerEmail,
      signerName: config.signerName,
      ccEmail: CC_EMAIL,
      ccName: CC_NAME,
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
        <h4>Ordered by ${config.signerName}</h4>
        <p style="margin-top:0em; margin-bottom:0em;">Email: ${config.signerEmail}</p>
        <p style="margin-top:0em; margin-bottom:0em;">Copy to: ${CC_NAME}, ${CC_EMAIL}</p>
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
    expect(document).to.contain(config.signerEmail);
    expect(document).to.contain(config.signerName);
    expect(document).to.contain(CC_EMAIL);
    expect(document).to.contain(CC_NAME);
    expect(document).to.be.equal(expected);
  });
})
