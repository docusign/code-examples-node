/**
 * @file
 * Example 013: Use embedded signing from a template with an added document
 * @author DocuSign
 */

const docusign = require("docusign-esign");

/**
 * This function does the work of creating the envelope and the
 * embedded Signing
 * @param {object} args object
 */
const addDocToTemplate = async (args) => {
  // Data for this method
  // args.basePath
  // args.accessToken
  // args.accountId

  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  let envelopesApi = new docusign.EnvelopesApi(dsApiClient);

  // Step 1. Make the envelope request body
  let envelope = makeEnvelope(args.envelopeArgs);

  // Step 2. call Envelopes::create API method
  // Exceptions will be caught by the calling function
  let results = await envelopesApi.createEnvelope(args.accountId, {
    envelopeDefinition: envelope,
  });

  let envelopeId = results.envelopeId;
  console.log(`Envelope was created. EnvelopeId ${envelopeId}`);

  // Step 3. create the recipient view, the embedded signing
  let viewRequest = makeRecipientViewRequest(args.envelopeArgs);
  // Call the CreateRecipientView API
  // Exceptions will be caught by the calling function
  results = await envelopesApi.createRecipientView(args.accountId, envelopeId, {
    recipientViewRequest: viewRequest,
  });

  return { envelopeId: envelopeId, redirectUrl: results.url };
};

/**
 * Creates envelope
 * @function
 * @param {Object} args object
 * @returns {Envelope} An envelope definition
 * @private
 */
function makeEnvelope(args) {
  // Data for this method
  // args.signerEmail
  // args.signerName
  // args.signerClientId
  // args.ccEmail
  // args.ccName
  // args.templateId

  // The envelope request object uses Composite Template to
  // include in the envelope:
  // 1. A template stored on the DocuSign service
  // 2. An additional document which is a custom HTML source document

  // Create Recipients for server template. Note that Recipients object
  // is used, not TemplateRole
  //
  // Create a signer recipient for the signer role of the server template
  let signer1 = docusign.Signer.constructFromObject({
    email: args.signerEmail,
    name: args.signerName,
    roleName: "signer",
    recipientId: "1",
    // Adding clientUserId transforms the template recipient
    // into an embedded recipient:
    clientUserId: args.signerClientId,
  });
  // Create the cc recipient
  let cc1 = docusign.CarbonCopy.constructFromObject({
    email: args.ccEmail,
    name: args.ccName,
    roleName: "cc",
    recipientId: "2",
  });
  // Recipients object:
  let recipientsServerTemplate = docusign.Recipients.constructFromObject({
    carbonCopies: [cc1],
    signers: [signer1],
  });

  // create a composite template for the Server Template
  let compTemplate1 = docusign.CompositeTemplate.constructFromObject({
    compositeTemplateId: "1",
    serverTemplates: [
      docusign.ServerTemplate.constructFromObject({
        sequence: "1",
        templateId: args.templateId,
      }),
    ],
    // Add the roles via an inlineTemplate
    inlineTemplates: [
      docusign.InlineTemplate.constructFromObject({
        sequence: "2",
        recipients: recipientsServerTemplate,
      }),
    ],
  });

  // The signer recipient for the added document with
  // a tab definition:
  let signHere1 = docusign.SignHere.constructFromObject({
    anchorString: "**signature_1**",
    anchorYOffset: "10",
    anchorUnits: "pixels",
    anchorXOffset: "20",
  });
  let signer1Tabs = docusign.Tabs.constructFromObject({
    signHereTabs: [signHere1],
  });

  // Signer definition for the added document
  let signer1AddedDoc = docusign.Signer.constructFromObject({
    email: args.signerEmail,
    name: args.signerName,
    clientId: args.signerClientId,
    roleName: "signer",
    recipientId: "1",
    tabs: signer1Tabs,
  });
  // Recipients object for the added document:
  let recipientsAddedDoc = docusign.Recipients.constructFromObject({
    carbonCopies: [cc1],
    signers: [signer1AddedDoc],
  });
  // create the HTML document
  let doc1 = new docusign.Document(),
    doc1b64 = Buffer.from(document1(args)).toString("base64");
  doc1.documentBase64 = doc1b64;
  doc1.name = "Appendix 1--Sales order"; // can be different from actual file name
  doc1.fileExtension = "html";
  doc1.documentId = "1";

  // create a composite template for the added document
  let compTemplate2 = docusign.CompositeTemplate.constructFromObject({
    compositeTemplateId: "2",
    // Add the recipients via an inlineTemplate
    inlineTemplates: [
      docusign.InlineTemplate.constructFromObject({
        sequence: "1",
        recipients: recipientsAddedDoc,
      }),
    ],
    document: doc1,
  });

  // create the envelope definition
  let env = docusign.EnvelopeDefinition.constructFromObject({
    status: "sent",
    compositeTemplates: [compTemplate1, compTemplate2],
  });

  return env;
}

/**
 * Creates document 1
 * @function
 * @private
 * @param {Object} args parameters for the envelope:
 *   <tt>signerEmail</tt>, <tt>signerName</tt>, <tt>ccEmail</tt>, <tt>ccName</tt>
 * @returns {string} A document in HTML format
 */

function document1(args) {
  // Data for this method
  // args.signerEmail
  // args.signerName
  // args.ccEmail
  // args.ccName
  // args.item
  // args.quantity

  return `
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
        <h4>Ordered by ${args.signerName}</h4>
        <p style="margin-top:0em; margin-bottom:0em;">Email: ${args.signerEmail}</p>
        <p style="margin-top:0em; margin-bottom:0em;">Copy to: ${args.ccName}, ${args.ccEmail}</p>
        <p style="margin-top:3em; margin-bottom:0em;">Item: <b>${args.item}</b>, quantity: <b>${args.quantity}</b> at market price.</p>
        <p style="margin-top:3em;">
  Candy bonbon pastry jujubes lollipop wafer biscuit biscuit. Topping brownie sesame snaps sweet roll pie. Croissant danish biscuit soufflé caramels jujubes jelly. Dragée danish caramels lemon drops dragée. Gummi bears cupcake biscuit tiramisu sugar plum pastry. Dragée gummies applicake pudding liquorice. Donut jujubes oat cake jelly-o. Dessert bear claw chocolate cake gummies lollipop sugar plum ice cream gummies cheesecake.
        </p>
        <!-- Note the anchor tag for the signature field is in white. -->
        <h3 style="margin-top:3em;">Agreed: <span style="color:white;">**signature_1**/</span></h3>
        </body>
    </html>
  `;
}

function makeRecipientViewRequest(args) {
  // Data for this method
  // args.dsReturnUrl
  // args.signerEmail
  // args.signerName
  // args.signerClientId
  // args.dsPingUrl

  let viewRequest = new docusign.RecipientViewRequest();

  // Set the url where you want the recipient to go once they are done signing
  // should typically be a callback route somewhere in your app.
  viewRequest.returnUrl = args.dsReturnUrl;

  // How has your app authenticated the user? In addition to your app's
  // authentication, you can include authenticate steps from DocuSign.
  // Eg, SMS authentication
  viewRequest.authenticationMethod = "none";

  // Recipient information must match embedded recipient info
  // we used to create the envelope.
  viewRequest.email = args.signerEmail;
  viewRequest.userName = args.signerName;
  viewRequest.clientUserId = args.signerClientId;

  // DocuSign recommends that you redirect to DocuSign for the
  // embedded signing. There are multiple ways to save state.
  // To maintain your application's session, use the pingUrl
  // parameter. It causes the DocuSign signing web page
  // (not the DocuSign server) to send pings via AJAX to your
  // app,
  viewRequest.pingFrequency = 600; // seconds
  // NOTE: The pings will only be sent if the pingUrl is an https address
  viewRequest.pingUrl = args.dsPingUrl; // optional setting

  return viewRequest;
}

module.exports = { addDocToTemplate };
