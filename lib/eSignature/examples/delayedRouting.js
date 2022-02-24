/**
 * @file
 * Example 035: Creates an envelope that would include two documents and add a signer and cc recipients to be notified via email
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

   // Step 1. Make the envelope request body
   let envelope = makeEnvelope(args.envelopeArgs);

   // Step 2. call Envelopes::create API method
   // Exceptions will be caught by the calling function
   let results = await envelopesApi.createEnvelope(args.accountId, {
     envelopeDefinition: envelope,
   });

   return results;
 };

 /**
  * Creates an envelope that would include two documents and add a signer and cc recipients to be notified via email
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
    // args.signer2xName
    // args.docPdf
    // args.delay


    // document 1 (pdf) has tag /sn1/
    //
    // The envelope has two recipients.
    // recipient 1 - signer

    let docPdfBytes;
    // read files from a local directory
    // The reads could raise an exception if the file is not available!
    docPdfBytes = fs.readFileSync(args.docPdf);

    // create the envelope definition
    let env = new docusign.EnvelopeDefinition();
    env.emailSubject = "Please sign this document set";

    // add the documents
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
      recipientId: "1",
      routingOrder: "1",
    });
    // routingOrder (lower means earlier) determines the order of deliveries
    // to the recipients. Parallel routing order is supported by using the
    // same integer as the order for two or more recipients.

    // Create a workflow model
    // Add the workflow rule that sets the schedule for the envelope to be sent
    const rule = docusign.EnvelopeDelayRuleApiModel.constructFromObject({
      delay: args.delay
    });
    const delayedRouting = docusign.delayedRoutingApiModel();
    delayedRouting.rules = [rule]

    // Create a workflow model
    const workflowStep = docusign.WorkflowStep.constructFromObject({
      action: "pause_before",
      triggerOnItem: "routing_order",
      itemId: 2,
      status: "pending",
      delayedRouting: delayedRouting
    });
    const workflow = docusign.Workflow.constructFromObject({
      workflowSteps: [workflowStep]
    });
    env.workflow = workflow;

    // Create signHere fields (also known as tabs) on the documents,
    // We're using anchor (autoPlace) positioning
    //
    // The DocuSign platform searches throughout your envelope's
    // documents for matching anchor strings. So the
    // signHere2 tab will be used in both document 2 and 3 since they
    // use the same anchor string for their "signer 1" tabs.
    let signHere1 = docusign.SignHere.constructFromObject({
        anchorString: "**signature_1**",
        anchorYOffset: "10",
        anchorUnits: "pixels",
        anchorXOffset: "20",
      }),
      signHere2 = docusign.SignHere.constructFromObject({
        anchorString: "/sn1/",
        anchorYOffset: "10",
        anchorUnits: "pixels",
        anchorXOffset: "20",
      });
    // Tabs are set per recipient / signer
    let signer1Tabs = docusign.Tabs.constructFromObject({
      signHereTabs: [signHere1, signHere2],
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

    return env;
 }

 module.exports = { SendEnvelopeWithDelayedRouting };
