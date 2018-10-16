/**
 * @file
 * Example 008: create a template if it doesn't already exist
 * @author DocuSign
 */

const path = require('path')
    , docusign = require('docusign-esign')
    , {promisify} = require('util') // http://2ality.com/2017/05/util-promisify.html
    , dsConfig = require('../../ds_configuration.js').config
    , fs = require('fs-extra')
    ;

const eg008CreateTemplate = exports
    , eg = 'eg008' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    , demoDocsPath = path.resolve(__dirname, '../../demo_documents')
    , docFile = 'World_Wide_Corp_fields.pdf'
    , templateName = 'Example Signer and CC template'
    ;

/**
 * Form page for this application
 */
eg008CreateTemplate.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuthCodeGrant.checkToken();
    if (tokenOK) {
        res.render('pages/examples/eg008CreateTemplate', {
            csrfToken: req.csrfToken(), 
            title: "Create a template",
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubExampleUrl + path.basename(__filename),
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation
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
eg008CreateTemplate.createController = async (req, res) => {
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

    // Step 2. Call the worker method
    let accountId = req.dsAuthCodeGrant.getAccountId()
      , dsAPIclient = req.dsAuthCodeGrant.getDSApi()
      , args = {
            dsAPIclient: dsAPIclient,
            accountId: accountId,
            templateName: templateName
        }
      , results = null
      ;

    try {
        results = await eg008CreateTemplate.worker (args)
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
    if (results) {
        // Save the templateId in the session so they can be used in future examples
        req.session.templateId = results.templateId;
        let msg = results.createdNewTemplate ? 
                "The template has been created!" :
                "Done. The template already existed in your account.";

        res.render('pages/example_done', {
            title: "Template results",
            h1: "Template results",
            message: `${msg}<br/>Template name: ${results.templateName}, ID ${results.templateId}.`
        });
    }
  }
  
  /**
   * This function does the work of checking to see if the template exists and creating it if not.
   * @param {object} args An object with the following elements: <br/>
   *   <tt>dsAPIclient</tt>: The DocuSign API Client object, already set with an access token and base url <br/>
   *   <tt>accountId</tt>: Current account Id <br/>
   *   <tt>templateName</tt>: The template's name <br/>
   */
  // ***DS.worker.start ***DS.snippet.1.start
  eg008CreateTemplate.worker = async (args) => {
    let templatesApi = new docusign.TemplatesApi(args.dsAPIclient)
      , createTemplateP = promisify(templatesApi.createTemplate).bind(templatesApi)
      , listTemplateP = promisify(templatesApi.listTemplates).bind(templatesApi)
      , results = null
      , templateId = null // the template that exists or will be created.
      , resultsTemplateName = null
      , createdNewTemplate = null
      ;
    
    // Step 1. See if the template already exists
    // Exceptions will be caught by the calling function
    results = await listTemplateP(args.accountId, {searchText: args.templateName});
    
    if (results.resultSetSize > 0) {
        templateId = results.envelopeTemplates[0].templateId;
        resultsTemplateName = results.envelopeTemplates[0].name;
        createdNewTemplate = false;
    } else {
        // Template doesn't exist. Therefore create it...
        // Step 2 Create the template
        let templateReqObject = makeTemplate();
        results = await createTemplateP(args.accountId, {envelopeTemplate: templateReqObject});
        templateId = results.templateId;
        resultsTemplateName = results.name;
        createdNewTemplate = true;
        //console.log(`template was created. TemplateId ${templateId}`);
    }

    return ({
        templateId: templateId,
        templateName: resultsTemplateName, 
        createdNewTemplate: createdNewTemplate}
    )
}

/**
 * Creates the template request object
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

    // Create fields using absolute positioning:
    let signHere = docusign.SignHere.constructFromObject({
            documentId: "1", pageNumber: "1", xPosition: "191", yPosition: "148"})
      , check1 = docusign.Checkbox.constructFromObject({
            documentId: "1", pageNumber: "1", xPosition: "75", yPosition: "417",
            tabLabel: "ckAuthorization"})
      , check2 = docusign.Checkbox.constructFromObject({
            documentId: "1", pageNumber: "1", xPosition: "75", yPosition: "447",
            tabLabel: "ckAuthentication"}) 
      , check3 = docusign.Checkbox.constructFromObject({
            documentId: "1", pageNumber: "1", xPosition: "75", yPosition: "478",
            tabLabel: "ckAgreement"})
      , check4 = docusign.Checkbox.constructFromObject({
            documentId: "1", pageNumber: "1", xPosition: "75", yPosition: "508",
            tabLabel: "ckAcknowledgement"})
      , list1 = docusign.List.constructFromObject({
            documentId: "1", pageNumber: "1", xPosition: "142", yPosition: "291",
            font: "helvetica", fontSize: "size14", tabLabel: "list",
            required: "false", 
            listItems: [ 
                docusign.ListItem.constructFromObject({text: "Red",    value: "red"   }),
                docusign.ListItem.constructFromObject({text: "Orange", value: "orange"}),
                docusign.ListItem.constructFromObject({text: "Yellow", value: "yellow"}),
                docusign.ListItem.constructFromObject({text: "Green",  value: "green" }),
                docusign.ListItem.constructFromObject({text: "Blue",   value: "blue"  }),
                docusign.ListItem.constructFromObject({text: "Indigo", value: "indigo"}),
                docusign.ListItem.constructFromObject({text: "Violet", value: "violet"})
            ]
        })

      // The SDK can't create a number tab at this time. Bug DCM-2732
      // Until it is fixed, use a text tab instead.
    //   , number = docusign.Number.constructFromObject({
    //         documentId: "1", pageNumber: "1", xPosition: "163", yPosition: "260",
    //         font: "helvetica", fontSize: "size14", tabLabel: "numbersOnly",
    //         height: "23", width: "84", required: "false"})
      , textInsteadOfNumber = docusign.Text.constructFromObject({
            documentId: "1", pageNumber: "1", xPosition: "153", yPosition: "260",
            font: "helvetica", fontSize: "size14", tabLabel: "numbersOnly",
            height: "23", width: "84", required: "false"})
      , radioGroup = docusign.RadioGroup.constructFromObject({
            documentId: "1", groupName: "radio1",
            radios: [
                docusign.Radio.constructFromObject({
                    font: "helvetica", fontSize: "size14", pageNumber: "1",
                    value: "white", xPosition: "142", yPosition: "384", required: "false"}),
                docusign.Radio.constructFromObject({
                    font: "helvetica", fontSize: "size14", pageNumber: "1",
                    value: "red", xPosition: "74", yPosition: "384", required: "false"}),
                docusign.Radio.constructFromObject({
                    font: "helvetica", fontSize: "size14", pageNumber: "1",
                    value: "blue", xPosition: "220", yPosition: "384", required: "false"}),
            ]})
      , text = docusign.Text.constructFromObject({
            documentId: "1", pageNumber: "1", xPosition: "153", yPosition: "230",
            font: "helvetica", fontSize: "size14", tabLabel: "text",
            height: "23", width: "84", required: "false"})
      ;

    // Tabs are set per recipient / signer
    let signer1Tabs = docusign.Tabs.constructFromObject({
        checkboxTabs: [check1, check2, check3, check4],
        listTabs: [list1],
        // numberTabs: [number],
        radioGroupTabs: [radioGroup],
        signHereTabs: [signHere],
        textTabs: [text, textInsteadOfNumber]
    });
    signer1.tabs = signer1Tabs;

    // Add the recipients to the env object
    let recipients = docusign.Recipients.constructFromObject({
        signers: [signer1],
        carbonCopies: [cc1]});

    // create the envelope template definition object
    let envelopeTemplateDefinition = 
        new docusign.EnvelopeTemplateDefinition.constructFromObject({
            description: 'Example template created via the API',
            name: templateName,
            shared: 'false'
        });

    // create the overall template definition
    let template = new docusign.EnvelopeTemplate.constructFromObject({
        // The order in the docs array determines the order in the env
        documents: [doc],
        emailSubject: 'Please sign this document',
        envelopeTemplateDefinition: envelopeTemplateDefinition,
        recipients: recipients,
        status: "created"
    });
    
    return template;
}
