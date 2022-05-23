/**
 * @file
 * Example 035: Delayed Routing
 * @author DocuSign
 */

 const fs = require("fs-extra");
 const docusign = require("docusign-esign");

 /**
  * This function does the work of creating the envelope
  * @param {object} args object
  */
 const SendEnvelopeWithDelayedRouting = async (args) => {
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
  * Creates an envelope with one document, two signers, and includes a delay before routing to the second signer.
  * @function
  * @param {Object} args object
  * @returns {Envelope} An envelope definition
  * @private
  */
  function makeEnvelope(args) {
    // Data for this method
    // args.signer1Email
    // args.signer1Name
    // args.signer2Email
    // args.signer2Name
    // args.docPdf
    // args.delay



    // document (pdf) has tag /sn1/
    //
    // The envelope has two recipients.
    // recipient 1 - signer
    // recipient 2 - signer
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
      email: args.signer1Email,
      name: args.signer1Name,
      recipientId: "1",
      routingOrder: "1",
    });

    let signer2 = docusign.Signer.constructFromObject({
      email: args.signer2Email,
      name: args.signer2Name,
      recipientId: "2",
      routingOrder: "2",
    });
    // routingOrder (lower means earlier) determines the order of deliveries
    // to the recipients. Parallel routing order is supported by using the
    // same integer as the order for two or more recipients.

    // Create a workflow model
    // Add the workflow rule that sets the delay in hours before the envelope is routed to the second signer
    let delayTime = "0." + args.delay.toString() + ":00:00";
    const rule = docusign.EnvelopeDelayRule.constructFromObject({
      delay: delayTime
    });
    const delayedRouting = docusign.DelayedRouting.constructFromObject({
      rules: [rule]
    });

    // Create a workflow model
    const workflowStep = docusign.WorkflowStep.constructFromObject({
      action: "pause_before",
      triggerOnItem: "routing_order",
      itemId: 2,
      delayedRouting: delayedRouting
    });
    const workflow = docusign.Workflow.constructFromObject({
      workflowSteps: [workflowStep]
    });
    env.workflow = workflow;

    // Create signHere fields (also known as tabs) on the document,
    // We're using anchor (autoPlace) positioning for the signHere1 tab
    // and we're using absolute positioning for the signHere2 tab.
    //
    // The DocuSign platform searches throughout your envelope's
    // documents for matching anchor strings.
    let signHere1 = docusign.SignHere.constructFromObject({
        anchorString: "/sn1/",
        anchorYOffset: "10",
        anchorUnits: "pixels",
        anchorXOffset: "20",
      }),
      signHere2 = docusign.SignHere.constructFromObject({
        xPosition: "320",
        yPosition: "175",
        pageNumber: "1",
        documentId: "1"
      });
    // Tabs are set per recipient / signer
    let signer1Tabs = docusign.Tabs.constructFromObject({
      signHereTabs: [signHere1],
    });
    signer1.tabs = signer1Tabs;

    let signer2Tabs = docusign.Tabs.constructFromObject({
      signHereTabs: [signHere2],
    });
    signer2.tabs = signer2Tabs;

    // Add the recipients to the envelope object
    let recipients = docusign.Recipients.constructFromObject({
      signers: [signer1, signer2]
    });
    env.recipients = recipients;

    // Request that the envelope be sent by setting |status| to "sent".
    // To request that the envelope be created as a draft, set to "created"
    env.status = "sent";
    // Step 2 end

    return env;
 }

 module.exports = { SendEnvelopeWithDelayedRouting };
