const settings = require('../config/appsettings.json');
const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
const helpers = require('./testHelpers');
const { createTemplate, makeTemplate } = require('../lib/eSignature/examples/createTemplate');
const { sendEnvelopeFromTemplate, makeEnvelope } = require('../lib/eSignature/examples/useTemplate');
const { addDocToTemplate } = require('../lib/eSignature/examples/addDocToTemplate')
const { setTabValues } = require('../lib/eSignature/examples/setTabValues')
const path = require('path');
const { authenticate, areEqual } = require('./testHelpers');
const { TEST_TEMPLATE_PDF_FILE, TEST_TEMPLATE_DOCX_FILE, TEMPLATE_NAME, BASE_PATH, signerClientId, returnUrl, pingUrl } = require('./constants')

let ACCOUNT_ID;
let ACCESS_TOKEN;
let TEMPLATE_ID = "12345678-1234-1234-1234-123456789123";

describe ('templateTests', function() {
  // before(async function() {
  //   this.timeout(0);

  //   const { accountId, accessToken } = await authenticate();
      
  //   ACCOUNT_ID = accountId;
  //   ACCESS_TOKEN = accessToken;
  // });

  it('createTemplate', async function() {
    this.timeout(0);

    const args = {
      accessToken: ACCESS_TOKEN,
      basePath: BASE_PATH,
      accountId: ACCOUNT_ID,
      templateName: TEMPLATE_NAME,
      docFile: TEST_TEMPLATE_PDF_FILE
    };

    const { templateId, templateName, createdNewTemplate } = await createTemplate(args);

    TEMPLATE_ID = templateId;

    should.exist(templateId);
    should.exist(templateName);
    should.equal(createdNewTemplate, true);
  });

  it('createTemplate_makeTemplate', async function() {
    this.timeout(0);

    const args = {
      templateName: TEMPLATE_NAME,
      docFile: TEST_TEMPLATE_PDF_FILE
    };

    const expected = {
      emailSubject: "Please sign this document",
      description: "Example template created via the API",
      name: "Example Signer and CC template",
      shared: "false",
      recipients: {
        signers: [
          {
            roleName: "signer",
            recipientId: "1",
            routingOrder: "1",
            tabs: {
              checkboxTabs: [
                {
                  documentId: "1",
                  pageNumber: "1",
                  xPosition: "75",
                  yPosition: "417",
                  tabLabel: "ckAuthorization",
                },
                {
                  documentId: "1",
                  pageNumber: "1",
                  xPosition: "75",
                  yPosition: "447",
                  tabLabel: "ckAuthentication",
                },
                {
                  documentId: "1",
                  pageNumber: "1",
                  xPosition: "75",
                  yPosition: "478",
                  tabLabel: "ckAgreement",
                },
                {
                  documentId: "1",
                  pageNumber: "1",
                  xPosition: "75",
                  yPosition: "508",
                  tabLabel: "ckAcknowledgement",
                }
              ],
              listTabs: [
                {
                  documentId: "1",
                  pageNumber: "1",
                  xPosition: "142",
                  yPosition: "291",
                  font: "helvetica",
                  fontSize: "size14",
                  tabLabel: "list",
                  required: "false",
                  listItems: [
                    {
                      text: "Red",
                      value: "red"
                    },
                    {
                      text: "Orange",
                      value: "orange",
                    },
                    {
                      text: "Yellow",
                      value: "yellow",
                    },
                    {
                      text: "Green",
                      value: "green",
                    },
                    {
                      text: "Blue",
                      value: "blue"
                    },
                    {
                      text: "Indigo",
                      value: "indigo",
                    },
                    {
                      text: "Violet",
                      value: "violet",
                    },
                  ],
                }
              ],
              radioGroupTabs: [
                {
                  documentId: "1",
                  groupName: "radio1",
                  radios: [
                    {
                      font: "helvetica",
                      fontSize: "size14",
                      pageNumber: "1",
                      value: "white",
                      xPosition: "142",
                      yPosition: "384",
                      required: "false",
                    },
                    {
                      font: "helvetica",
                      fontSize: "size14",
                      pageNumber: "1",
                      value: "red",
                      xPosition: "74",
                      yPosition: "384",
                      required: "false",
                    },
                    {
                      font: "helvetica",
                      fontSize: "size14",
                      pageNumber: "1",
                      value: "blue",
                      xPosition: "220",
                      yPosition: "384",
                      required: "false",
                    },
                  ],
                }
              ],
              signHereTabs: [
                {
                  documentId: "1",
                  pageNumber: "1",
                  xPosition: "191",
                  yPosition: "148",
                }
              ],
              textTabs: [
                {
                  documentId: "1",
                  pageNumber: "1",
                  xPosition: "153",
                  yPosition: "230",
                  font: "helvetica",
                  fontSize: "size14",
                  tabLabel: "text",
                  height: "23",
                  width: "84",
                  required: "false",
                },
                {
                  documentId: "1",
                  pageNumber: "1",
                  xPosition: "153",
                  yPosition: "260",
                  font: "helvetica",
                  fontSize: "size14",
                  tabLabel: "numbersOnly",
                  height: "23",
                  width: "84",
                  required: "false",
                }
              ]
            }
          }
        ],
        carbonCopies: [
          {
            roleName: "cc",
            routingOrder: "2",
            recipientId: "2",
          }
        ]
      },
      status: "created",
    };   
    
    const template = await makeTemplate(args);

    should.exist(template);
    expect(template).excluding('documents').to.deep.equal(expected);
  });

  it('useTemplate', async function() {
    this.timeout(0);

    const envelopeArgs  = {
      templateId: TEMPLATE_ID,
      signerEmail: settings.signerEmail,
      signerName: settings.signerName,
      ccEmail: 'test@mail.com',
      ccName: 'Test Name'
    };
    const args = {
      accessToken: ACCESS_TOKEN,
      basePath: BASE_PATH,
      accountId: ACCOUNT_ID,
      envelopeArgs: envelopeArgs
    };

    const results = await sendEnvelopeFromTemplate(args);

    should.exist(results);
  });

  it('useTemplate_makeEnvelope', async function() {
    this.timeout(0);

    const envelopeArgs  = {
      templateId: TEMPLATE_ID,
      signerEmail: settings.signerEmail,
      signerName: settings.signerName,
      ccEmail: 'test@mail.com',
      ccName: 'Test Name'
    };

    const expected = {
      templateId: TEMPLATE_ID,
      templateRoles: [
        {
          email: settings.signerEmail,
          name: settings.signerName,
          roleName: "signer",
        },
        {
          email: 'test@mail.com',
          name: 'Test Name',
          roleName: "cc",
        }
      ],
      status: 'sent'
    };

    const envelope = await makeEnvelope(envelopeArgs);

    should.exist(envelope);
    // expect(areEqual(envelope, expected)).to.be.true;
  });

  it('addDocToTemplate', async function() {
    this.timeout(0);

    const envelopeArgs  = {
      templateId: TEMPLATE_ID,
      signerEmail: settings.signerEmail,
      signerName: settings.signerName,
      signerClientId: signerClientId,
      ccEmail: 'test@mail.com',
      ccName: 'Test Name',
      item: 'Item',
      quantity: '5',
      dsReturnUrl: returnUrl,
      dsPingUrl: pingUrl
    };
    const args = {
      accessToken: ACCESS_TOKEN,
      basePath: BASE_PATH,
      accountId: ACCOUNT_ID,
      envelopeArgs: envelopeArgs
    };

    const { envelopeId, redirectUrl } = await addDocToTemplate(args);

    should.exist(envelopeId);
    should.exist(redirectUrl);
  });

  it('setTabValues', async function() {
    this.timeout(0);

    const envelopeArgs  = {
      signerEmail: settings.signerEmail,
      signerName: settings.signerName,
      signerClientId: signerClientId,
      dsReturnUrl: returnUrl,
      docFile: TEST_TEMPLATE_DOCX_FILE
    };
    const args = {
      accessToken: ACCESS_TOKEN,
      basePath: BASE_PATH,
      accountId: ACCOUNT_ID,
      envelopeArgs: envelopeArgs
    };

    const { envelopeId, redirectUrl } = await setTabValues(args);

    should.exist(envelopeId);
    should.exist(redirectUrl);
  });
});
