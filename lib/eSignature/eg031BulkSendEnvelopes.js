/**
 * @file
 * Example 31: Bulk sending
 * @author DocuSign
 */

const path = require('path')
    , fs = require('fs-extra')
    , docusign = require('docusign-esign')
    , validator = require('validator')
    , dsConfig = require('../../config/index.js').config
    ;

const eg031BulkSendEnvelopes = exports
    , eg = 'eg031' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    , doc2File = 'World_Wide_Corp_Battle_Plan_Trafalgar.docx'
    , demoDocsPath = path.resolve(__dirname, '../../demo_documents')
    ;

/**
 * Create the envelope
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg031BulkSendEnvelopes.createController = async (req, res) => {
    // Check the token
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user
    let tokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (! tokenOK) {
        req.flash('info', 'Sorry, you need to re-authenticate.');
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }

    let body = req.body
    let results
    ,doc2DocxBytes = fs.readFileSync(path.resolve(demoDocsPath, doc2File))
    // Additional data validation might also be appropriate
    , list1 = {
        signer: {
            name: validator.escape(body.signerName1),
            email: validator.escape(body.signerEmail1),
        },
        cc: {
            name: validator.escape(body.ccName1),
            email: validator.escape(body.ccEmail1),
        }
    }
    , list2 = {
        signer: {
            name: validator.escape(body.signerName2),
            email: validator.escape(body.signerEmail2),
        },
        cc: {
            name: validator.escape(body.ccName2),
            email: validator.escape(body.ccEmail2),
        }
    }

    // Step 1. Obtain your OAuth token
    args = {
        accessToken: req.user.accessToken,  // Represents your {ACCESS_TOKEN}
        basePath: req.session.basePath,
        accountId: req.session.accountId,   // Represents your {ACCOUNT_ID}
    }

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

    // Step 2. Construct your API headers
    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(args.basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);

    let bulkEnvelopesApi = new docusign.BulkEnvelopesApi(dsApiClient)
    let envelopeApi = new docusign.EnvelopesApi(dsApiClient)

    try {
         // Step 3. Create bulk list
        let bulkList = await bulkEnvelopesApi.createBulkSendList(args.accountId,
             {
                 bulkSendingList: {
                    name: "sample.csv",
                    bulkCopies:[
                        {
                            recipients: recipients(list1)
                        },
                        {
                            recipients: recipients(list2)
                        },
                    ]
                }
         })

        // Step 4. Create the draft envelope
        let envelope = await envelopeApi.createEnvelope(args.accountId,
            {
                envelopeDefinition: {
                    envelopeIdStamping: "true",
                    emailSubject: "Please sign",
                    status: "Created",
                    documents: [
                        {
                            documentBase64: Buffer.from(doc2DocxBytes).toString('base64'),
                            name: "Battle Plan",
                            fileExtension: "docx",
                            documentId: "1"
                        }
                    ]
                }
            })

        // Step 5. Add an envelope custom field set to the value of your listId EnvelopeCustomFields::create)
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

        // Step 6. Add placeholder recipients
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

        //Step 7: Initiate the Bulk Send by posting your listId, and the envelopeId
        let bulkResult = await bulkEnvelopesApi.createBulkSendRequest(args.accountId, bulkList.listId,
            {
                bulkSendRequest: {
                    envelopeOrTemplateId: envelope.envelopeId
                }
        })

        // Step 8. Confirm successful bulk send 
        results = await bulkEnvelopesApi.getBulkSendBatchStatus(args.accountId, bulkResult.batchId)
    }
    catch (error) {
        console.log(error)
        let errorBody = error && error.response && error.response.body
            // We can pull the DocuSign error code and message from the response body
            , errorCode = errorBody && errorBody.errorCode
            , errorMessage = errorBody && errorBody.message
            ;
        // In production, you may want to provide customized error messages and
        // remediation advice to the user
        res.render('pages/error', {err: error, errorCode: errorCode, errorMessage: errorMessage});
    }

    if (results) {
        console.log(results)
        res.render('pages/example_done', {
            title: "Bulk sent",
            h1: "Bulk send envelope was successfully performed!",
            message: `Bulk request queued to ${results.queued} user lists.`
        });
    }
}

// ***DS.snippet.0.end

/**
 * Form page for this application
 */
eg031BulkSendEnvelopes.getController = async (req, res) => {
    // Check that the authentication token is okay with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate,
    // since they have not yet entered any information into the form
    let tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {

        res.render('pages/examples/eg031BulkSendEnvelopes', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Bulk sending",
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubExampleUrl + 'eSignature/' + path.basename(__filename),
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation
        });
    } else {
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
}
