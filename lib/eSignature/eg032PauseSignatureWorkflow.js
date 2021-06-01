/**
 * @file
 * Example 32: Pause a signature workflow
 * @author DocuSign
 */

const path = require("path")
    , fs = require("fs-extra")
    , docusign = require("docusign-esign")
    , validator = require("validator")
    , dsConfig = require("../../config/index.js").config
    ;

const eg032PauseSignatureWorkflow = exports
    , eg = "eg032"
    , mustAuthenticate = "/ds/mustAuthenticate"
    , minimumBufferMin = 3
    , demoDocumentsPath = path.resolve(__dirname, "../../demo_documents")
    ;

/**
 * Creates envelope
 * @function
 * @param {Object} args The parameter for envelope definition
 * @return {docusign.EnvelopeDefinition} The envelope definition
 */
const makeEnvelop = (args) => {
    // Step 3. Construct the request body

    // Read and encode file. Put encoded value to Document entity.
    // The reads could raise an exception if the file is not available!
    const documentTxtExample = fs.readFileSync(path.resolve(demoDocumentsPath, dsConfig.docTxt));
    const encodedExampleDocument = Buffer.from(documentTxtExample).toString("base64");
    const document = docusign.Document.constructFromObject({
        documentBase64: encodedExampleDocument,
        name: "Welcome",
        fileExtension: "txt",
        documentId: 1
    });

    // Create signHere fields (also known as tabs) on the documents
    const signHere1 = docusign.SignHere.constructFromObject({
        documentId: 1,
        pageNumber: 1,
        tabLabel: "Sign Here",
        xPosition: 200,
        yPosition: 200
    });
    const signHere2 = docusign.SignHere.constructFromObject({
        documentId: 1,
        pageNumber: 1,
        tabLabel: " Sign Here",
        xPosition: 300,
        yPosition: 200
    });

    // Create the signer recipient models
    // routingOrder (lower means earlier) determines the order of deliveries
    // to the recipients.
    // Also add the tabs model (including the sign_here tabs) to the signer
    const signer1 = docusign.Signer.constructFromObject({
        email: args["signer1Email"],
        name: args["signer1Name"],
        recipientId: 1,
        routingOrder: 1,
        tabs: docusign.Tabs.constructFromObject({
            signHereTabs: [signHere1]
        })
    });
    const signer2 = docusign.Signer.constructFromObject({
        email: args["signer2Email"],
        name: args["signer2Name"],
        recipientId: 2,
        routingOrder: 2,
        tabs: docusign.Tabs.constructFromObject({
            signHereTabs: [signHere2]
        })
    });

    // The envelope has two recipients: recipient 1 - signer1 and recipient 2 - signer2.
    // The envelope will be sent first to the signer1.
    // After it is signed, a signature workflow will be paused.
    // After resuming (unpause) the signature workflow will send to the second recipient
    const recipients = docusign.Recipients.constructFromObject({
        signers: [signer1, signer2]
    });

    // Create a workflow model
    // Signature workflow will be paused after it is signed by the first signer
    const workflowStep = docusign.WorkflowStep.constructFromObject({
        action: "pause_before",
        triggerOnItem: "routing_order",
        itemId: 2
    });
    const workflow = docusign.Workflow.constructFromObject({
        workflowSteps: [workflowStep]
    });

    // Put our created values (document, status, workflow, recipients)
    // to our EnvelopeDefinition object.
    // Request that the envelope be sent by setting status to "sent".
    // To request that the envelope be created as a draft, set status to "created"
    return docusign.EnvelopeDefinition.constructFromObject({
        emailSubject: "EnvelopeWorkflowTest",
        documents: [document],
        status: args.status,
        workflow,
        recipients
    });
}

/**
 * Work with creating of the envelope
 * @param {Object} args Arguments for creating envelope
 * @return {Object} The object with value of envelopeId or error
 */
const worker = async (args) => {
    
    // Step 2. Construct your API headers
    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(args.basePath);
    dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);

    const envelopeDefinition = makeEnvelop(args.envelopeArgs)

    // Step 4. Call the eSignature API
    // Exceptions will be caught by the calling function
    const envelopesApi = new docusign.EnvelopesApi(dsApiClient);
    const envelope = await envelopesApi.createEnvelope(args.accountId, { envelopeDefinition });

    const { envelopeId } = envelope;
    console.log(`Envelope was created. EnvelopeId ${envelopeId}`);
    return { envelopeId };
}

/**
 * Create envelope with paused signature workflow
 * @param {Object} req Request obj
 * @param {Object} res Response obj
 */
eg032PauseSignatureWorkflow.createController = async (req, res) => {
    // Step 1. Check the token
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user
    const tokenOk = req.dsAuth.checkToken(minimumBufferMin);
    if (!tokenOk) {
        req.flash("info", "Sorry, you need to re-authenticate.");
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }

    // Step 2. Get required arguments
    const { body } = req;
    let results = null;
    const envelopeArgs = {
        signer1Email: validator.escape(body.signer1Email),
        signer1Name: validator.escape(body.signer1Name),
        signer2Email: validator.escape(body.signer2Email),
        signer2Name: validator.escape(body.signer2Name),
        status: "Sent"
    };
    const args = {
        accessToken: req.user.accessToken,
        basePath: req.session.basePath,
        accountId: req.session.accountId,
        envelopeArgs
    };

    // Step 3. Call the worker method
    try {
        results = await worker(args)
    }
    catch (error) {
        const errorBody = error && error.response && error.response.body
            // We can pull the DocuSign error code and message from the response body
            , errorCode = errorBody && errorBody.errorCode
            , errorMessage = errorBody && errorBody.message
        ;
        // In production, you may want to provide customized error messages and
        // remediation advice to the user
        res.render("pages/error", { err: error, errorCode, errorMessage });
    }

    if (results) {
        // Save for use by other examples that need an envelopeId
        req.session.pausedEnvelopeId = results.envelopeId;
        res.render("pages/example_done", {
            title: "Envelope sent",
            h1: "Envelope sent",
            message: `The envelope has been created and sent!<br/>
                      Envelope ID ${results.envelopeId}.<br/>
                      <p>To resume a workflow after the first recipient signs
                      the envelope use <a href="eg033">example 33.</a><br/>`
        });
    }
}


/**
 * Render page with our form for the example
 * @param {Object} req Request obj
 * @param {Object} res Response obj
 */
eg032PauseSignatureWorkflow.getController = async (req, res) => {
    // Check that the authentication token is okay with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate,
    // since they have not yet entered any information into the form
    const tokenOk = req.dsAuth.checkToken();
    if (tokenOk){
        res.render("pages/examples/eg032PauseSignatureWorkflow", {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Pausing a signature workflow",
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
