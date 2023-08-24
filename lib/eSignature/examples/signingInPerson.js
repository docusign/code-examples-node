/**
 * @file
 * Example 039: Send an envelope to an In Person Signer
 * @author DocuSign
 */

const fs = require("fs-extra");
const docusign = require("docusign-esign");

/**
 * This function does the work of creating the envelope and the
 * DocuSign session for the In Person Signing
 * @param {object} args Data for this method
 * @param {string} args.basePath The API base path URL
 * @param {string} args.accessToken The access token
 * @param {string} args.accountId The account ID
 * @param {object} args.envelopeArgs Data for creating an envelope
 * @param {string} args.envelopeArgs.hostEmail The email of host
 * @param {string} args.envelopeArgs.hostName The name of host
 * @param {string} args.envelopeArgs.signerName The name of signer
 * @param {string} args.envelopeArgs.dsReturnUrl The URL where recipient will be redirected after signing the document
 * @param {string} args.envelopeArgs.dsPingUrl The URL where pings will be sent from DocuSign signing web page
 * @param {string} args.envelopeArgs.docFile Path to the document
 */
const sendEnvelopeForInPersonSigning = async (args) => {

  //ds-snippet-start:eSign39Step3
  const dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  const envelopesApi = new docusign.EnvelopesApi(dsApiClient);

  // Make the envelope request body
  const envelope = makeEnvelope(args.envelopeArgs);

  // Call Envelopes::create API method
  // Exceptions will be caught by the calling function
  let results = await envelopesApi.createEnvelope(args.accountId, {
    envelopeDefinition: envelope,
  });

  const envelopeId = results.envelopeId;
  //ds-snippet-end:eSign39Step3
  console.log(`Envelope was created. EnvelopeId ${envelopeId}`);

  // Create the recipient view, the embedded signing
  //ds-snippet-start:eSign39Step5
  const viewRequest = makeRecipientViewRequest(args.envelopeArgs);
  // Call the CreateRecipientView API
  // Exceptions will be caught by the calling function
  results = await envelopesApi.createRecipientView(args.accountId, envelopeId, {
    recipientViewRequest: viewRequest,
  });
  //ds-snippet-end:eSign39Step5

  return { envelopeId: envelopeId, redirectUrl: results.url };
};

/**
 * Creates envelope
 * @function
 * @param {object} args Data for creating an envelope
 * @param {string} args.hostEmail The email of host
 * @param {string} args.hostName The name of host
 * @param {string} args.signerName The name of signer
 * @param {string} args.docFile Path to the document
 * @returns {Envelope} An envelope definition
 * @private
 */

//ds-snippet-start:eSign39Step2
function makeEnvelope(args) {
  // document 1 (pdf) has tag /sn1/
  //
  // The envelope has one recipients.
  // recipient 1 - inPersonSigner

  // read file from a local directory
  // The read could raise an exception if the file is not available!
  const docPdfBytes = fs.readFileSync(args.docFile);

  // create the envelope definition
  let env = new docusign.EnvelopeDefinition();
  env.emailSubject = "Please sign this document";

  // add the documents
  let doc1 = new docusign.Document(),
    doc1b64 = Buffer.from(docPdfBytes).toString("base64");
  doc1.documentBase64 = doc1b64;
  doc1.name = "Lorem Ipsum"; // can be different from actual file name
  doc1.fileExtension = "pdf";
  doc1.documentId = "1";

  // The order in the docs array determines the order in the envelope
  env.documents = [doc1];

  // Create a inPersonSigner recipient to sign the document, identified by host name and email and signer name
  // We're setting the parameters via the object creation
  const inPersonSigner = docusign.InPersonSigner.constructFromObject({
    hostEmail: args.hostEmail,
    hostName: args.hostName,
    signerName: args.signerName,
    recipientId: 1,
    routingOrder: 1,
  });

  // Create signHere fields (also known as tabs) on the documents,
  // We're using anchor (autoPlace) positioning
  //
  // The DocuSign platform seaches throughout your envelope's
  // documents for matching anchor strings.
  const signHere = docusign.SignHere.constructFromObject({
    anchorString: "/sn1/",
    anchorYOffset: "10",
    anchorUnits: "pixels",
    anchorXOffset: "20",
  });
  // Tabs are set per recipient / signer
  const signerTabs = docusign.Tabs.constructFromObject({
    signHereTabs: [signHere],
  });
  inPersonSigner.tabs = signerTabs;

  // Add the recipient to the envelope object
  const recipients = docusign.Recipients.constructFromObject({
    inPersonSigners: [inPersonSigner],
  });
  env.recipients = recipients;

  // Request that the envelope be sent by setting |status| to "sent".
  // To request that the envelope be created as a draft, set to "created"
  env.status = "sent";

  return env;
}

  //ds-snippet-end:eSign39Step2

/**
 * Creates recipient view definition
 * @function
 * @param {object} args Data for creating a recipient view
 * @param {string} args.hostEmail The email of host
 * @param {string} args.hostName The name of host
 * @param {string} args.dsReturnUrl The URL where recipient will be redirected after signing the document
 * @param {string} args.dsPingUrl The URL where pings will be sent from DocuSign signing web page
 * @returns {docusign.RecipientViewRequest} A recipient view definition
 * @private
 */
//ds-snippet-start:eSign39Step4
function makeRecipientViewRequest(args) {
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
  viewRequest.email = args.hostEmail;
  viewRequest.userName = args.hostName;

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
//ds-snippet-end:eSign39Step4

module.exports = { sendEnvelopeForInPersonSigning };
