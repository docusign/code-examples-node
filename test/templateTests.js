const settings = require('../config/appsettings.json');
const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
const fs = require('fs');
const { createTemplate, makeTemplate } = require('../lib/eSignature/examples/createTemplate');
const { sendEnvelopeFromTemplate, makeEnvelope: makeEnvelopeForUsingTemplate } = require('../lib/eSignature/examples/useTemplate');
const { addDocToTemplate, makeEnvelope: makeEnvelopeForAddingDoc, document1: document1ForAddingDoc, makeRecipientViewRequest: makeRecipientViewRequestForAddingDoc } = require('../lib/eSignature/examples/addDocToTemplate')
const { setTabValues, makeEnvelope: makeEnvelopeForSetTabValues } = require('../lib/eSignature/examples/setTabValues')
const path = require('path');
const { authenticate, areEqual } = require('./testHelpers');
const { TEST_TEMPLATE_PDF_FILE, TEST_TEMPLATE_DOCX_FILE, TEMPLATE_NAME, BASE_PATH, signerClientId, returnUrl, pingUrl } = require('./constants')

let ACCOUNT_ID;
let ACCESS_TOKEN;
let TEMPLATE_ID = "12345678-1234-1234-1234-123456789123";

describe ('templateTests', function() {
  before(async function() {
    this.timeout(0);

    const { accountId, accessToken } = await authenticate();
      
    ACCOUNT_ID = accountId;
    ACCESS_TOKEN = accessToken;
  });

  it('createTemplate', async function() {
    this.timeout(0);

    const newTemplateName = `${TEMPLATE_NAME}_${Date.now()}`;
    const args = {
      accessToken: ACCESS_TOKEN,
      basePath: BASE_PATH,
      accountId: ACCOUNT_ID,
      templateName: newTemplateName,
      docFile: TEST_TEMPLATE_PDF_FILE
    };

    const { templateId, templateName, createdNewTemplate } = await createTemplate(args);

    TEMPLATE_ID = templateId;

    should.exist(templateId);
    should.exist(templateName);
    should.equal(templateName, newTemplateName);
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
      name: TEMPLATE_NAME,
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
      documents: [
        {
          documentBase64: Buffer.from(fs.readFileSync(TEST_TEMPLATE_PDF_FILE)).toString("base64"),
          name: "Lorem Ipsum",
          fileExtension: "pdf",
          documentId: "1",
        }
      ],
      status: "created",
    };   
    
    const template = await makeTemplate(args);

    should.exist(template);
    expect(template).excluding(['']).to.deep.equal(expected);
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

    const envelope = await makeEnvelopeForUsingTemplate(envelopeArgs);

    should.exist(envelope);
    expect(areEqual(envelope, expected)).to.be.true;
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

  it('addDocToTemplate_makeEnvelope', async function() {
    this.timeout(0);

    const item = 'Item';
    const quantity = '5';

    const envelopeArgs  = {
      templateId: TEMPLATE_ID,
      signerEmail: settings.signerEmail,
      signerName: settings.signerName,
      signerClientId: signerClientId,
      ccEmail: 'test@mail.com',
      ccName: 'Test Name',
      item: item,
      quantity: quantity,
      dsReturnUrl: returnUrl,
      dsPingUrl: pingUrl
    };

    const documentText = `
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
        <p style="margin-top:3em; margin-bottom:0em;">Item: <b>${item}</b>, quantity: <b>${quantity}</b> at market price.</p>
        <p style="margin-top:3em;">
  Candy bonbon pastry jujubes lollipop wafer biscuit biscuit. Topping brownie sesame snaps sweet roll pie. Croissant danish biscuit soufflé caramels jujubes jelly. Dragée danish caramels lemon drops dragée. Gummi bears cupcake biscuit tiramisu sugar plum pastry. Dragée gummies applicake pudding liquorice. Donut jujubes oat cake jelly-o. Dessert bear claw chocolate cake gummies lollipop sugar plum ice cream gummies cheesecake.
        </p>
        <!-- Note the anchor tag for the signature field is in white. -->
        <h3 style="margin-top:3em;">Agreed: <span style="color:white;">**signature_1**/</span></h3>
        </body>
    </html>
  `;

    const expected = {
      compositeTemplates: [
        {
          compositeTemplateId: "1",
          serverTemplates: [
            {
              sequence: "1",
              templateId: TEMPLATE_ID,
            },
          ],
          inlineTemplates: [
            {
              sequence: "2",
              recipients: {
                carbonCopies: [
                  {
                    email: 'test@mail.com',
                    name: 'Test Name',
                    roleName: "cc",
                    recipientId: "2",
                  }
                ],
                signers: [
                  {
                    email: settings.signerEmail,
                    name: settings.signerName,
                    roleName: "signer",
                    recipientId: "1",
                    clientUserId: signerClientId,
                  }
                ],
              },
            },
          ],
        },
        {
          compositeTemplateId: "2",
          inlineTemplates: [
            {
              sequence: "1",
              recipients: {
                carbonCopies: [
                  {
                    email: 'test@mail.com',
                    name: 'Test Name',
                    roleName: "cc",
                    recipientId: "2",
                  }
                ],
                signers: [
                  {
                    email: settings.signerEmail,
                    name: settings.signerName,
                    roleName: "signer",
                    recipientId: "1",
                    tabs: {
                      signHereTabs: [
                        {
                          anchorString: "**signature_1**",
                          anchorYOffset: "10",
                          anchorUnits: "pixels",
                          anchorXOffset: "20",
                        }
                      ]
                    },
                  }
                ],
              },
            },
          ],
          document: {
            documentBase64: Buffer.from(documentText).toString("base64"),
            name: "Appendix 1--Sales order",
            fileExtension: "html",
            documentId: "1",
          }
        }
      ],
      status: 'sent'
    };

    const envelope = await makeEnvelopeForAddingDoc(envelopeArgs);

    should.exist(envelope);
    expect(envelope).excluding(['']).to.deep.equal(expected);
  });

  it('addDocToTemplate_document1', async function() {
    this.timeout(0);
    
    const item = 'Item';
    const quantity = '5';
    const envelopeArgs  = {
      templateId: TEMPLATE_ID,
      signerEmail: settings.signerEmail,
      signerName: settings.signerName,
      ccEmail: 'test@mail.com',
      ccName: 'Test Name',
      item: item,
      quantity: quantity,
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
        <p style="margin-top:3em; margin-bottom:0em;">Item: <b>${item}</b>, quantity: <b>${quantity}</b> at market price.</p>
        <p style="margin-top:3em;">
  Candy bonbon pastry jujubes lollipop wafer biscuit biscuit. Topping brownie sesame snaps sweet roll pie. Croissant danish biscuit soufflé caramels jujubes jelly. Dragée danish caramels lemon drops dragée. Gummi bears cupcake biscuit tiramisu sugar plum pastry. Dragée gummies applicake pudding liquorice. Donut jujubes oat cake jelly-o. Dessert bear claw chocolate cake gummies lollipop sugar plum ice cream gummies cheesecake.
        </p>
        <!-- Note the anchor tag for the signature field is in white. -->
        <h3 style="margin-top:3em;">Agreed: <span style="color:white;">**signature_1**/</span></h3>
        </body>
    </html>
  `

    const document = await document1ForAddingDoc(envelopeArgs);

    should.exist(document);
    expect(document).to.be.equal(expected);
  });

  it('addDocToTemplate_makeRecipientView', async function() {
    this.timeout(0);

    const envelopeArgs  = {
      signerEmail: settings.signerEmail,
      signerName: settings.signerName,
      signerClientId: signerClientId,
      dsReturnUrl: returnUrl,
      dsPingUrl: pingUrl,
    };

    const expected = {
      returnUrl: returnUrl,
      authenticationMethod: 'none',
      email: settings.signerEmail,
      userName: settings.signerName,
      clientUserId: signerClientId,
      pingFrequency: 600,
      pingUrl: pingUrl
    };

    const viewRequest = await makeRecipientViewRequestForAddingDoc(envelopeArgs);

    should.exist(viewRequest);
    expect({...viewRequest}).to.deep.equal({...expected});
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

  it('setTabValues_makeEnvelope', async function() {
    this.timeout(0);

    const envelopeArgs  = {
      signerEmail: settings.signerEmail,
      signerName: settings.signerName,
      signerClientId: signerClientId,
      dsReturnUrl: returnUrl,
      docFile: TEST_TEMPLATE_DOCX_FILE
    };

    const expected = {
      emailSubject: "Please sign this salary document",
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
                  anchorUnits: "pixels",
                  anchorYOffset: "10",
                  anchorXOffset: "20",
                }
              ],
              textTabs: [
                {
                  anchorString: "/legal/",
                  anchorUnits: "pixels",
                  anchorYOffset: "-9",
                  anchorXOffset: "5",
                  font: "helvetica",
                  fontSize: "size11",
                  bold: "true",
                  value: settings.signerName,
                  locked: "false",
                  tabId: "legal_name",
                  tabLabel: "Legal name",
                },
                {
                  anchorString: "/familiar/",
                  anchorUnits: "pixels",
                  anchorYOffset: "-9",
                  anchorXOffset: "5",
                  font: "helvetica",
                  fontSize: "size11",
                  bold: "true",
                  value: settings.signerName,
                  locked: "false",
                  tabId: "familiar_name",
                  tabLabel: "Familiar name",
                },
                {
                  anchorString: "/salary/",
                  anchorUnits: "pixels",
                  anchorYOffset: "-9",
                  anchorXOffset: "5",
                  font: "helvetica",
                  fontSize: "size11",
                  bold: "true",
                  value: '$123,000',
                  locked: "true",
                  tabId: "salary",
                  tabLabel: "Salary",
                }
              ],
            }
          }
        ]
      },
      status: "sent",
      customFields: {
        textCustomFields: [
          {
            name: "salary",
            required: "false",
            show: "true",
            value: '123000',
          }
        ]
      },
      documents: [
        {
          documentBase64: Buffer.from(fs.readFileSync(TEST_TEMPLATE_DOCX_FILE)).toString("base64"),
          name: "Lorem Ipsum",
          fileExtension: "docx",
          documentId: "1",
        }
      ]
    }

    const envelope = await makeEnvelopeForSetTabValues(envelopeArgs);

    should.exist(envelope);
    expect(envelope).excluding(['']).to.deep.equal(expected);
  });
});
