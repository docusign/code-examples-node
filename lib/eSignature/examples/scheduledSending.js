/**
 * @file
 * Example 035: Scheduled Sending
 * @author DocuSign
 */

 const fs = require("fs-extra");
 const docusign = require("docusign-esign");

 /**
  * This function does the work of creating the envelope
  * @param {object} args object
  */
 const scheduleEnvelope = async (args) => {
   // Data for this method
   // args.basePath
   // args.accessToken
   // args.accountId

   let dsApiClient = new docusign.ApiClient();
   dsApiClient.setBasePath(args.basePath);
   dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
   let envelopesApi = new docusign.EnvelopesApi(dsApiClient);

   // Make the envelope request body
   let envelope = makeEnvelope(args.envelopeArgs);

   // call Envelopes::create API method
   // Exceptions will be caught by the calling function
   // Step 3 start
   let results = await envelopesApi.createEnvelope(args.accountId, {
     envelopeDefinition: envelope,
   });
   // Step 3 end

   return results;
 };

 /**
  * Creates and schedules an envelope that includes one document and a single signer to be notified via email
  * @function
  * @param {Object} args object
  * @returns {Envelope} An envelope definition
  * @private
  */
  function makeEnvelope(args) {
    // Data for this method
    // args.signerEmail
    // args.signerName
    // args.docPdf
    // args.resumeDate


    // document (pdf) has tag /sn1/
    //
    // The envelope has a single recipient.
    // recipient 1 - signer

    // Step 2 start
    let docPdfBytes;
    // read files from a local directory
    // The reads could raise an exception if the file is not available!
    docPdfBytes = fs.readFileSync(args.docPdf);

    // create the envelope definition
    let env = new docusign.EnvelopeDefinition();
    env.emailSubject = "Please sign this document";

    // add the document
    let doc = new docusign.Document(),
      docb64 = Buffer.from(docPdfBytes).toString("base64");
    doc.documentBase64 = docb64;
    doc.name = "Lorem Ipsum", // can be different from actual file name
    doc.fileExtension = "pdf"; // Source data format. Signed docs are always pdf.
    doc.documentId = "1"; // a label used to reference the doc

    // The order in the docs array determines the order in the envelope
    env.documents = [doc];

    // create a signer recipient to sign the document, identified by name and email
    // We're setting the parameters via the object constructor
    let signer1 = docusign.Signer.constructFromObject({
      email: args.signerEmail,
      name: args.signerName,
      recipientId: "1",
      routingOrder: "1",
    });
    // routingOrder (lower means earlier) determines the order of deliveries
    // to the recipients. Parallel routing order is supported by using the
    // same integer as the order for two or more recipients.

    // Create a workflow model
    // Add the workflow rule that sets the schedule for the envelope to be sent
    const rule = docusign.EnvelopeDelayRule.constructFromObject({
      resumeDate: args.resumeDate.toString()
    });
    const scheduledSendingModel = docusign.ScheduledSending.constructFromObject({
      rules: [rule]
    });

    const workflow = docusign.Workflow.constructFromObject({
      scheduledSending: scheduledSendingModel
    });
    env.workflow = workflow;

    // Create a signHere field (also known as a tab) on the document,
    // We're using anchor (autoPlace) positioning
    //
    // The DocuSign platform searches throughout your envelope's
    // documents for matching anchor strings.
    let signHere1 = docusign.SignHere.constructFromObject({
        anchorString: "/sn1/",
        anchorYOffset: "10",
        anchorUnits: "pixels",
        anchorXOffset: "20",
      });
    // Tabs are set per recipient / signer
    let signer1Tabs = docusign.Tabs.constructFromObject({
      signHereTabs: [signHere1],
    });
    signer1.tabs = signer1Tabs;

    // Add the recipients to the envelope object
    let recipients = docusign.Recipients.constructFromObject({
      signers: [signer1]
    });
    env.recipients = recipients;

    // Request that the envelope be sent by setting |status| to "sent".
    // To request that the envelope be created as a draft, set to "created"
    env.status = "sent";
    // Step 2 end

    return env;
 }

 module.exports = { scheduleEnvelope };
