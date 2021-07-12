/**
 * @file
 * Example 33: Unpause a signature workflow
 * @author DocuSign
 */

const path = require("path")
    , docusign = require("docusign-esign")
    , dsConfig = require("../../config/index.js").config
    ;

const eg033UnpauseSignatureWorkflow = exports
    , eg = "eg033"
    , mustAuthenticate = "/ds/mustAuthenticate"
    , minimumBufferMin = 3
    ;

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

    // Step 3. Construct the request body
    const workflow = docusign.Workflow.constructFromObject({
        workflowStatus: "in_progress"
    });
    const envelopeDefinition = docusign.EnvelopeDefinition.constructFromObject({ workflow });

    // Step 4. Call the eSignature API
    // Exceptions will be caught by the calling function
    const envelopesApi = new docusign.EnvelopesApi(dsApiClient);
    const result = await envelopesApi.update(
        args.accountId,
        args.envelopeId, {envelopeDefinition, resendEnvelope: true}
    );
    
    return { envelopeId: result.envelopeId };
}


/**
 * Create envelope with paused signature workflow
 * @param {Object} req Request obj
 * @param {Object} res Response obj
 */
eg033UnpauseSignatureWorkflow.createController = async (req, res) => {
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
    let results;

    // Step 2. Get required arguments
    const args = {
        accessToken: req.user.accessToken,
        basePath: req.session.basePath,
        accountId: req.session.accountId,
        envelopeId: req.session.pausedEnvelopeId,
    };

    // Step 3. Call the worker method
    try {
        results = await worker(args);
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
        res.render("pages/example_done", {
            title: "Envelope unpaused",
            h1: "Envelope unpaused",
            envelopeOk: true,
            message: `The envelope workflow has been resumed and 
                      the envelope has been sent to a second recipient!<br/>
                      Envelope ID ${results.envelopeId}.<br/>`
        });
    }
}


/**
 * Render page with our form for the example
 * @param {Object} req Request obj
 * @param {Object} res Response obj
 */
eg033UnpauseSignatureWorkflow.getController = async (req, res) => {
    // Check that the authentication token is okay with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate,
    // since they have not yet entered any information into the form
    const tokenOk = req.dsAuth.checkToken();
    if (tokenOk){
        res.render("pages/examples/eg033UnpauseSignatureWorkflow", {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Unpausing a signature workflow",
            envelopeOk: req.session.hasOwnProperty("pausedEnvelopeId"),
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

