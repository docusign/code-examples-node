/**
 * @file
 * Example 038: Signable HTML document
 * @author DocuSign
 */

const fs = require("fs-extra");
const docusign = require("docusign-esign");

/**
 * This function does the work of creating the envelope in
 * draft mode and returning a URL for the sender's view
 * @param {object} args object
 */
 const sendEnvelope = async (args) => {
  // Data for this method
  // args.basePath
  // args.accessToken
  // args.accountId

  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  let envelopesApi = new docusign.EnvelopesApi(dsApiClient);

  // Step 1. Make the envelope body
  let envelope = makeEnvelope(args.envelopeArgs);

  // Step 2. Send the envelope
  let results = await envelopesApi.createEnvelope(args.accountId, {
    envelopeDefinition: envelope,
  });
  let envelopeId = results.envelopeId;

  // Step 3. Create the recipient view
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
 * @param {Object} args parameters for the envelope
 * @returns {Envelope} An envelope definition
 * @private
 */
function makeEnvelope(args) {
  // Data for this method
  // args.signerEmail
  // args.signerName
  // args.ccEmail
  // args.ccName
  // args.status

  // document (html) has tag /sn1/
  //
  // The envelope has two recipients.
  // recipient 1 - signer
  // recipient 2 - cc
  // The envelope will be sent first to the signer.
  // After it is signed, a copy is sent to the cc person.

  // create a signer recipient to sign the document, identified by name and email
  // We're setting the parameters via the object constructor
  let signer = docusign.Signer.constructFromObject({
    email: args.signerEmail,
    name: args.signerName,
    clientUserId: args.signerClientId,
    recipientId: "1",
    routingOrder: "1",
    roleName: "Signer",
  });
  // routingOrder (lower means earlier) determines the order of deliveries
  // to the recipients. Parallel routing order is supported by using the
  // same integer as the order for two or more recipients.

  // create a cc recipient to receive a copy of the documents, identified by name and email
  // We're setting the parameters via setters
  let cc = new docusign.CarbonCopy.constructFromObject({
    email: args.ccEmail,
    name: args.ccName,
    routingOrder: "2",
    recipientId: "2",
  });
  
  // Add the recipients to the envelope object
  let recipients = docusign.Recipients.constructFromObject({
    signers: [signer],
    carbonCopies: [cc],
  });

  // add the document
  
  let htmlDefinition = new docusign.DocumentHtmlDefinition();
  htmlDefinition.source = getHTMLDocument(args);

  let document = new docusign.Document();
  document.name = "doc1.html"; // can be different from actual file name
  document.documentId = "1"; // a label used to reference the doc
  document.htmlDefinition = htmlDefinition;

  // create the envelope definition
  let env = new docusign.EnvelopeDefinition();
  env.emailSubject = "Example Signing Document";
  env.documents = [document];
  env.recipients = recipients;
  env.status = args.status;
  
  return env;
}

/**
 * Gets the HTML document
 * @function
 * @private
 * @param {Object} args parameters for the envelope
 * @returns {string} A document in HTML format
 */

function getHTMLDocument(args) {
  // Data for this method
  // args.signerEmail
  // args.signerName
  // args.ccEmail
  // args.ccName

  let docHTMLContent = fs.readFileSync(args.docFile, { encoding: "utf8" });

  // Substitute values into the HTML
  // Substitute for: {signerName}, {signerEmail}, {ccName}, {ccEmail}
  return docHTMLContent
    .replace("{signerName}", args.signerName)
    .replace("{signerEmail}", args.signerEmail)
    .replace("{ccName}", args.ccName)
    .replace("{ccEmail}", args.ccEmail)
    .replace("/sn1/", "<ds-signature data-ds-role=\"Signer\"/>")
    .replace("/l1q/", "<input data-ds-type=\"number\"/>")
    .replace("/l2q/", "<input data-ds-type=\"number\"/>");
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
  // The query parameter is included as an example of how
  // to save/recover state information during the redirect to
  // the DocuSign signing. It's usually better to use
  // the session mechanism of your web framework. Query parameters
  // can be changed/spoofed very easily.
  viewRequest.returnUrl = args.dsReturnUrl + "?state=123";

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

module.exports = { sendEnvelope };
