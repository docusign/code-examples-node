/**
 * @file
 * Example 31: Bulk sending
 * @author DocuSign
 */

 const fs = require("fs-extra");
 const docusign = require("docusign-esign");

 /**
  * This function does the work of creating the envelope
  */
 const bulkSendEnvelopes = async (args) => {
   let docBytes = fs.readFileSync(args.docFile);
   let recipients = (list) => {
     return [
       {
         name: list.signer.name,
         email: list.signer.email,
         roleName: "signer",
       },
       {
         name: list.cc.name,
         email: list.cc.email,
         roleName: "CC",
       },
     ];
   };

   // Construct your API headers
   //ds-snippet-start:eSign31Step2
   let dsApiClient = new docusign.ApiClient();
   dsApiClient.setBasePath(args.basePath);
   dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
   //ds-snippet-end:eSign31Step2

   let bulkEnvelopesApi = new docusign.BulkEnvelopesApi(dsApiClient);
   let envelopeApi = new docusign.EnvelopesApi(dsApiClient);

   // Create bulk list
   //ds-snippet-start:eSign31Step3
   let bulkList = await bulkEnvelopesApi.createBulkSendList(args.accountId, {
     bulkSendingList: {
       name: "sample.csv",
       bulkCopies: [
         {
           recipients: recipients(args.list1),
         },
         {
           recipients: recipients(args.list2),
         },
       ],
     },
   });
   //ds-snippet-end:eSign31Step2

   // Create the draft envelope
   //ds-snippet-start:eSign31Step4
   let envelope = await envelopeApi.createEnvelope(args.accountId, {
     envelopeDefinition: {
       envelopeIdStamping: "true",
       emailSubject: "Please sign",
       status: "Created",
       documents: [
         {
           documentBase64: Buffer.from(docBytes).toString("base64"),
           name: "lorem",
           fileExtension: "pdf",
           documentId: "2",
         },
       ],
       recipients: {
         signers: [
           {
             name: "Multi Bulk Recipient::signer",
             email: "multiBulkRecipients-signer@docusign.com",
             roleName: "signer",
             routingOrder: "1",
             status: "created",
             deliveryMethod: "email",
             recipientId: "1",
             recipientType: "signer",
             tabs: docusign.Tabs.constructFromObject({
               signHereTabs: [docusign.SignHere.constructFromObject({
                 anchorString: "/sn1/",
                 anchorYOffset: "10",
                 anchorUnits: "pixels",
                 anchorXOffset: "20",
               })],
             })
           },
         ],
         carbonCopies: [
           {
             name: "Multi Bulk Recipient::cc",
             email: "multiBulkRecipients-cc@docusign.com",
             roleName: "cc",
             routingOrder: "2",
             status: "created",
             deliveryMethod: "email",
             recipientId: "2",
             recipientType: "cc",
           },
         ],
       },
     },
   });
   //ds-snippet-end:eSign31Step4

   // Add an envelope custom field set to the value of your listId EnvelopeCustomFields::create)
   // This Custom Field is used for tracking your Bulk Send via the Envelopes::Get method
   //ds-snippet-start:eSign31Step5
   await envelopeApi.createCustomFields(args.accountId, envelope.envelopeId, {
     customFields: {
       textCustomFields: [
         {
           name: "mailingListId",
           required: "false",
           show: "false",
           value: bulkList.listId,
         },
       ],
     },
   });
   //ds-snippet-end:eSign31Step5

   //Initiate the Bulk Send by posting your listId, and the envelopeId
   //ds-snippet-start:eSign31Step6
   let bulkResult = await bulkEnvelopesApi.createBulkSendRequest(
     args.accountId,
     bulkList.listId,
     {
       bulkSendRequest: {
         envelopeOrTemplateId: envelope.envelopeId,
       },
     }
   );
      //ds-snippet-end:eSign31Step6

   // Confirm successful bulk send
   //ds-snippet-start:eSign31Step7
   let results = await bulkEnvelopesApi.getBulkSendBatchStatus(
     args.accountId,
     bulkResult.batchId
   );
   //ds-snippet-end:eSign31Step7

   return results;
 };

 module.exports = { bulkSendEnvelopes };
