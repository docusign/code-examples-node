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
   // Step 2 start
   let dsApiClient = new docusign.ApiClient();
   dsApiClient.setBasePath(args.basePath);
   dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
   // Step 2 end

   let bulkEnvelopesApi = new docusign.BulkEnvelopesApi(dsApiClient);
   let envelopeApi = new docusign.EnvelopesApi(dsApiClient);

   // Create bulk list
   // Step 3 start
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
   // Step 3 end

   // Create the draft envelope
   // Step 4 start
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
   // Step 4 end

   // Add an envelope custom field set to the value of your listId EnvelopeCustomFields::create)
   // This Custom Field is used for tracking your Bulk Send via the Envelopes::Get method
   // Step 5 start
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
   // Step 5 end

   //Initiate the Bulk Send by posting your listId, and the envelopeId
   // Step 6 start
   let bulkResult = await bulkEnvelopesApi.createBulkSendRequest(
     args.accountId,
     bulkList.listId,
     {
       bulkSendRequest: {
         envelopeOrTemplateId: envelope.envelopeId,
       },
     }
   );
   // Step 6 end

   // Confirm successful bulk send
   // Step 7 start
   let results = await bulkEnvelopesApi.getBulkSendBatchStatus(
     args.accountId,
     bulkResult.batchId
   );
   // Step 7 end

   return results;
 };

 module.exports = { bulkSendEnvelopes };
