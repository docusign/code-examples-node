/**
 * @file
 * Example 008: create a template
 * @author DocuSign
 */

const path = require('path')
    , docusign = require('docusign-esign')
    , dsConfig = require('../../ds_configuration.js').config
    , fs = require('fs-extra')
    ;

const eg008 = exports
    , eg = 'eg008' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    , demoDocsPath = path.resolve(__dirname, '../../demo_documents')
    , docFile = 'World_Wide_Corp_lorem.pdf'
    ;

/**
 * Form page for this application
 */
eg008.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuthCodeGrant.checkToken();
    if (tokenOK) {
        res.render('pages/examples/eg008', {
            csrfToken: req.csrfToken(), 
            title: "Create a template",
            source: dsConfig.githubExampleUrl + path.basename(__filename)
        });
    } else {
        // Save the current operation so it will be resumed after authentication
        req.dsAuthCodeGrant.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
}  

/**
 * Create a template
 * @param {object} req Request obj 
 * @param {object} res Response obj
 */
eg008.createController = async (req, res) => {
    let body = req.body
        // Additional data validation might also be appropriate
      , template = makeTemplate()
      , accountId = req.dsAuthCodeGrant.getAccountId()
      , templatesApi = new docusign.TemplatesApi(req.dsAuthCodeGrant.getDSApi())
      , createTemplateP = req.dsAuthCodeGrant.makePromise(templatesApi, 'createTemplate')
      ;
    
    // Step 1. Check the token
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user.
    let tokenOK = req.dsAuthCodeGrant.checkToken(minimumBufferMin);
    if (! tokenOK) {
        req.flash('info', 'Sorry, you need to re-authenticate.');
        // We could store the parameters of the requested operation 
        // so it could be restarted automatically.
        // But since it should be rare to have a token issue here,
        // we'll make the user re-enter the form data after 
        // authentication.
        req.dsAuthCodeGrant.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }

    // Step 2. Create the template
    let results = null;
    try {
        results = await createTemplateP(accountId, {envelopeTemplate: template});
    } 
    catch (error) {
        let errorBody = error && error.response && error.response.body
            // we can pull the DocuSign error code and message from the response body
          , errorCode = errorBody && errorBody.errorCode
          , errorMessage = errorBody && errorBody.message
          ;
        // In production, may want to provide customized error messages and 
        // remediation advice to the user.
        res.render('pages/error', {err: error, errorCode: errorCode, errorMessage: errorMessage});
    }
    if (!results) {return}

    let templateId = results.templateId;
    //console.log(`template was created. TemplateId ${templateId}`);
    req.session.templateId = templateId; // Save for use by other examples which need an envelopeId
    let templateName = results.name;

    res.render('pages/example_done', {
        title: "Template created",
        h1: "Template created",
        message: `The template has been created!<br/>Template name: ${templateName}, ID ${templateId}.`
    });
}

/**
 * Creates the template
 * <br>Document 1: A PDF document.
 * @function
 * @returns {template} An template definition
 * @private
 */
function makeTemplate(){
    // document 1 (pdf) has tag /sn1/
    //
    // The template has two recipient roles.
    // recipient 1 - signer
    // recipient 2 - cc
    // The template will be sent first to the signer.
    // After it is signed, a copy is sent to the cc person.

    let docPdfBytes;
    // read file from a local directory
    // The reads could raise an exception if the file is not available!
    docPdfBytes = fs.readFileSync(path.resolve(demoDocsPath, docFile));

    // add the documents
    let doc = new docusign.Document()
      , docB64 = Buffer.from(docPdfBytes).toString('base64')
      ;
    doc.documentBase64 = docB64;
    doc.name = 'Lorem Ipsum'; // can be different from actual file name
    doc.fileExtension = 'pdf';
    doc.documentId = '1';

    // create a signer recipient to sign the document, identified by name and email
    // We're setting the parameters via the object creation
    let signer1 = docusign.Signer.constructFromObject({
        roleName: 'signer',
        recipientId: '1',
        routingOrder: '1'});
    // routingOrder (lower means earlier) determines the order of deliveries
    // to the recipients. Parallel routing order is supported by using the
    // same integer as the order for two or more recipients.

    // create a cc recipient to receive a copy of the documents, identified by name and email
    // We're setting the parameters via setters
    let cc1 = new docusign.CarbonCopy();
    cc1.roleName = 'cc';
    cc1.routingOrder = '2';
    cc1.recipientId = '2';

    // Create signHere fields (also known as tabs) on the documents,
    // We're using anchor (autoPlace) positioning
    //
    // The DocuSign platform searches throughout your env's
    // documents for matching anchor strings. So the
    // signHere2 tab will be used in both document 2 and 3 since they
    // use the same anchor string for their "signer 1" tabs.
    let signHere = docusign.SignHere.constructFromObject({
        xPosition: "191",
        yPosition: "150",
        documentId: "1",
        pageNumber: "1"});

    // Tabs are set per recipient / signer
    let signer1Tabs = docusign.Tabs.constructFromObject({
        signHereTabs: [signHere]});
    signer1.tabs = signer1Tabs;

    // Add the recipients to the env object
    let recipients = docusign.Recipients.constructFromObject({
        signers: [signer1],
        carbonCopies: [cc1]});

    // create the envelope template definition object
    let envelopeTemplateDefinition = 
        new docusign.EnvelopeTemplateDefinition.constructFromObject({
            description: 'Example template created via the API',
            name: 'Example Signer and CC template',
            shared: 'false'
        });

    // create the overall template definition
    let template = new docusign.EnvelopeTemplate.constructFromObject({
        // The order in the docs array determines the order in the env
        documents: [doc],
        emailSubject: 'Please sign this document',
        envelopeTemplateDefinition: envelopeTemplateDefinition,
        recipients: recipients,
        status: "sent"
    });
    
    return template;
}
