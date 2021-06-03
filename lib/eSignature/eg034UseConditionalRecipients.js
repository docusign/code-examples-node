/**
 * @file
 * Example 34: Use conditional recipients
 * @author DocuSign
 */

const path = require("path")
    , fs = require("fs-extra")
    , docusign = require("docusign-esign")
    , validator = require("validator")
    , dsConfig = require("../../config/index.js").config
    ;

const eg034UseConditionalRecipients = exports
    , eg = "eg034"
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
const makeEnvelope = (args) => {
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
        recipientId: 2,
        xPosition: 300,
        yPosition: 200
    });

    // Create checkbox field on the documents
    const checkbox = docusign.Checkbox.constructFromObject({
        documentId: 1,
        pageNumber: 1,
        name: "ClickToApprove",
        selected: false,
        tabLabel: "ApproveWhenChecked",
        xPosition: 50,
        yPosition: 50
    });

    // Create the signer recipient models
    // Also add the tabs model (including the sign_here tabs) to the signer
    const signer1 = docusign.Signer.constructFromObject({
        email: args["signer1Email"],
        name: args["signer1Name"],
        recipientId: 1,
        routingOrder: 1,
        roleName: "Purchaser",
        tabs: docusign.Tabs.constructFromObject({
            signHereTabs: [signHere1],
            checkboxTabs: [checkbox]
        })
    });
    const signer2 = docusign.Signer.constructFromObject({
        email: "placeholder@example.com",
        name: "Approver",
        recipientId: 2,
        routingOrder: 2,
        roleName: "Approver",
        tabs: docusign.Tabs.constructFromObject({
            signHereTabs: [signHere2]
        })
    });

    const recipients = docusign.Recipients.constructFromObject({
        signers: [signer1, signer2]
    });

    // Create recipientOption and recipientGroup models
    const signer2a = docusign.RecipientOption.constructFromObject({
        email: args["signer2aEmail"],
        name: args["signer2aName"],
        roleName: "Signer when not checked",
        recipientLabel: "signer2a"
    });
    const signer2b = docusign.RecipientOption.constructFromObject({
        email: args["signer2bEmail"],
        name: args["signer2bName"],
        roleName: "Signer when checked",
        recipientLabel: "signer2b"
    });
    const recipientGroup = docusign.RecipientGroup.constructFromObject({
       groupName: "Approver",
        groupMessage: "Members of this group approve a workflow",
        recipients: [signer2a, signer2b]
    });

    // Create conditionalRecipientRuleFilter models
    const filter1 = docusign.ConditionalRecipientRuleFilter.constructFromObject({
        scope: "tabs",
        recipientId: 1,
        tabId: "ApprovalTab",
        operator: "equals",
        value: false,
        tabLabel: "ApproveWhenChecked",
        tabType: "checkbox"
    });
    const filter2 = docusign.ConditionalRecipientRuleFilter.constructFromObject({
        scope: "tabs",
        recipientId: 1,
        tabId: "ApprovalTab",
        operator: "equals",
        value: true,
        tabLabel: "ApproveWhenChecked",
        tabType: "checkbox"
    });

    // Create conditionalRecipientRuleCondition models
    const condition1 = docusign.ConditionalRecipientRuleCondition.constructFromObject({
        filters: [filter1],
        order: 1,
        recipientLabel: "signer2a"
    });
    const condition2 = docusign.ConditionalRecipientRuleCondition.constructFromObject({
        filters: [filter2],
        order: 2,
        recipientLabel: "signer2b"
    });

    // Create conditionalRecipientRule model
    const conditionalRecipient = docusign.ConditionalRecipientRule.constructFromObject({
        conditions: [condition1, condition2],
        recipientGroup: recipientGroup,
        recipientId: 2,
        order: 0
    });

    // Create recipientRouting model
    const recipientRouting = docusign.RecipientRouting.constructFromObject({
       rules: docusign.RecipientRules.constructFromObject({
           conditionalRecipients: [conditionalRecipient]
       })
    });

    // Create a workflow model
    const workflowStep = docusign.WorkflowStep.constructFromObject({
        action: "pause_before",
        triggerOnItem: "routing_order",
        itemId: 2,
        status: "pending",
        recipientRouting: recipientRouting
    });
    const workflow = docusign.Workflow.constructFromObject({
        workflowSteps: [workflowStep]
    });

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

    const envelopeDefinition = makeEnvelope(args.envelopeArgs)
    
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
eg034UseConditionalRecipients.createController = async (req, res) => {
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
        signer2aEmail: validator.escape(body.signer2aEmail),
        signer2aName: validator.escape(body.signer2aName),
        signer2bEmail: validator.escape(body.signer2bEmail),
        signer2bName: validator.escape(body.signer2bName),
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
            ;
        let errorMessage = errorBody && errorBody.message
            , errorInfo = "";
        // In production, you may want to provide customized error messages and
        // remediation advice to the user
        if(errorCode.includes("WORKFLOW_UPDATE_RECIPIENTROUTING_NOT_ALLOWED")){
            errorMessage = "Update to the workflow with recipient routing is not allowed for your account!"; 
            errorInfo = "Please contact with our <a href='https://developers.docusign.com/support/' target='_blank'>support team</a> to resolve this issue."
        }
        res.render("pages/error_eg34", { err: error, errorCode, errorMessage, errorInfo });
    }

    if (results) {
        // Save for use by other examples that need an envelopeId
        req.session.pausedEnvelopeId = results.envelopeId;
        res.render("pages/example_done", {
            title: "Use conditional recipients",
            h1: "Use conditional recipients",
            message: `Envelope ID ${results.envelopeId} with the conditional 
                      routing criteria has been created and sent to the first recipient!`
        });
    }
}

/**
 * Render page with our form for the example
 * @param {Object} req Request obj
 * @param {Object} res Response obj
 */
eg034UseConditionalRecipients.getController = async (req, res) => {
    // Check that the authentication token is okay with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate,
    // since they have not yet entered any information into the form
    const tokenOk = req.dsAuth.checkToken();
    if (tokenOk){
        res.render("pages/examples/eg034UseConditionalRecipients", {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Using conditional recipients",
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
