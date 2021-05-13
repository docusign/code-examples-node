/**
 * @file
 * Example 31: Bulk sending
 * @author DocuSign
 */

const fs = require('fs-extra')
    , docusign = require('docusign-esign')

const bulkSendEnvelopes = exports

bulkSendEnvelopes.createEnvelope = async (args) => {
    let docBytes = fs.readFileSync(args.docFile)
    let recipients = (list) => {
        return [
            {

                name: list.signer.name,
                email: list.signer.email,
                roleName: "signer"
            },
            {
                name: list.cc.name,
                email: list.cc.email,
                roleName: "CC"
            }
        ]
    }

    // Step 1. Construct your API headers
    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(args.basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);

    let bulkEnvelopesApi = new docusign.BulkEnvelopesApi(dsApiClient)
    let envelopeApi = new docusign.EnvelopesApi(dsApiClient)

     // Step 2. Create bulk list
    let bulkList = await bulkEnvelopesApi.createBulkSendList(args.accountId,
         {
             bulkSendingList: {
                name: "sample.csv",
                bulkCopies:[
                    {
                        recipients: recipients(args.list1)
                    },
                    {
                        recipients: recipients(args.list2)
                    },
                ]
            }
     })

    // Step 3. Create the draft envelope
    let envelope = await envelopeApi.createEnvelope(args.accountId,
        {
            envelopeDefinition: {
                envelopeIdStamping: "true",
                emailSubject: "Please sign",
                status: "Created",
                documents: [
                    {
                        documentBase64: Buffer.from(docBytes).toString('base64'),
                        name: "Battle Plan",
                        fileExtension: "docx",
                        documentId: "1"
                    }
                ]
            }
        })

    // Step 4. Add an envelope custom field set to the value of your listId EnvelopeCustomFields::create)
    // This Custom Field is used for tracking your Bulk Send via the Envelopes::Get method
    await envelopeApi.createCustomFields(args.accountId, envelope.envelopeId,
        {
            customFields: {
                textCustomFields: [
                    {
                        name: "mailingListId",
                        required: "false",
                        show: "false",
                        value: bulkList.listId
                    }
                ]
            }
    })

    // Step 5. Add placeholder recipients
    // These will be replaced by the details provided in the Bulk List uploaded during Step 3
    // Note: The name / email format used is:
    // Name: Multi Bulk Recipients::{rolename}
    // Email: MultiBulkRecipients-{rolename}@docusign.com
    await envelopeApi.createRecipient(args.accountId, envelope.envelopeId,
        {
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
                        recipientType: "signer"
                    },
                    {
                        name: "Multi Bulk Recipient::cc",
                        email: "multiBulkRecipients-cc@docusign.com",
                        roleName: "cc",
                        routingOrder: "1",
                        status: "created",
                        deliveryMethod: "email",
                        recipientId: "2",
                        recipientType: "cc"
                    }
                ]
        }
    })

    //Step 6: Initiate the Bulk Send by posting your listId, and the envelopeId
    let bulkResult = await bulkEnvelopesApi.createBulkSendRequest(args.accountId, bulkList.listId,
        {
            bulkSendRequest: {
                envelopeOrTemplateId: envelope.envelopeId
            }
    })

    // Step 7. Confirm successful bulk send 
    let results = await bulkEnvelopesApi.getBulkSendBatchStatus(args.accountId, bulkResult.batchId)

    return results;
}
