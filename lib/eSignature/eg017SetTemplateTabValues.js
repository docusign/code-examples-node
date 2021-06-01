/**
 * @file
 * Example 017: Set template tab (field) values and an envelope custom field value
 * @author DocuSign
 */

const path = require('path')
    , docusign = require('docusign-esign')
    , validator = require('validator')
    , dsConfig = require('../../config/index.js').config
    ;

const eg017SetTemplateTabValues = exports
    , eg = 'eg017' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    ;


/**
 * Send envelope with a template
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg017SetTemplateTabValues.createController = async (req, res) => {
    // Step 1. Check the token
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user.
    let tokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (! tokenOK) {
        req.flash('info', 'Sorry, you need to re-authenticate.');
        // Save the current operation so it will be resumed after authentication
        req.dsAuth.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }

    if (!req.session.templateId) {
        res.render('pages/examples/eg017SetTemplateTabValues', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Send envelope using a template",
            templateOk: req.session.templateId,
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubExampleUrl + 'eSignature/' + path.basename(__filename),
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation
        });
    }

    // Step 2. Call the worker method
    let body = req.body
        // Additional data validation might also be appropriate
      , signerEmail = validator.escape(body.signerEmail)
      , signerName = validator.escape(body.signerName)
      , ccEmail = validator.escape(body.ccEmail)
      , ccName = validator.escape(body.ccName)
      , envelopeArgs = {
            templateId: req.session.templateId,
            signerEmail: signerEmail,
            signerName: signerName,
            signerClientId: 1000,
            ccEmail: ccEmail,
            ccName: ccName,
            dsReturnUrl: dsConfig.appUrl + '/ds-return'
        }
      , args = {
            accessToken: req.user.accessToken,
            basePath: req.session.basePath,
            accountId: req.session.accountId,
            envelopeArgs: envelopeArgs
        }
      , results = null
      ;

    try {
        results = await eg017SetTemplateTabValues.worker (args)
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
        req.session.envelopeId = results.envelopeId; // Save for use by other examples
                                                     // which need an envelopeId
        // Redirect the user to the embedded signing
        // Don't use an iFrame!
        // State can be stored/recovered using the framework's session or a
        // query parameter on the returnUrl (see the makeRecipientViewRequest method)
        res.redirect(results.redirectUrl);
    }
}

/**
 * This function does the work of creating the envelope
 * @param {object} args
 */
// ***DS.snippet.0.start
eg017SetTemplateTabValues.worker = async (args) => {
    // Data for this method
    // args.basePath
    // args.accessToken
    // args.accountId
    // args.envelopeArgs.signerEmail
    // args.envelopeArgs.signerName
    // args.envelopeArgs.signerClientId
    // args.envelopeArgs.dsReturnUrl

    // 1. Create envelope definition
    let envelopeArgs = args.envelopeArgs
      , envelopeDefinition = makeEnvelope(envelopeArgs);

    // 2. Create the envelope
    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(args.basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    let envelopesApi = new docusign.EnvelopesApi(dsApiClient)
      , results = await envelopesApi.createEnvelope(
            args.accountId, {envelopeDefinition: envelopeDefinition})
      , envelopeId = results.envelopeId
      ;

    // 3. create the recipient view, the embedded signing
    let viewRequest = docusign.RecipientViewRequest.constructFromObject({
            returnUrl: envelopeArgs.dsReturnUrl,
            authenticationMethod: 'none',
            email: envelopeArgs.signerEmail,
            userName: envelopeArgs.signerName,
            clientUserId: envelopeArgs.signerClientId});

    // 4. Call the CreateRecipientView API
    // Exceptions will be caught by the calling function
    results = await envelopesApi.createRecipientView(args.accountId, envelopeId,
        {recipientViewRequest: viewRequest});

    return ({envelopeId: envelopeId, redirectUrl: results.url})
}

/**
 * Creates envelope from the template
 * @function
 * @param {Object} args
 * @returns {Envelope} An envelope definition
 * @private
 */
function makeEnvelope(args){
    // Data for this method
    // args.signerEmail
    // args.signerName
    // args.signerClientId
    // args.ccEmail
    // args.ccName
    // args.templateId

    // The envelope has two recipients.
    // recipient 1 - signer
    // recipient 2 - cc
    // This method sets values for many of the template's tabs.
    // It also adds a new tab, and adds a custom metadata field

    // create the envelope definition with the template id
    let envelopeDefinition = docusign.EnvelopeDefinition.constructFromObject({
        templateId: args.templateId, status: 'sent'
    });

    // Set the values for the fields in the template
    // List item
    let list1 = docusign.List.constructFromObject({
        value: "green", documentId: "1", pageNumber: "1", tabLabel: "list"});

    // Checkboxes
    let check1 = docusign.Checkbox.constructFromObject({
            tabLabel: 'ckAuthorization', selected: "true"})
      , check3 = docusign.Checkbox.constructFromObject({
            tabLabel: 'ckAgreement', selected: "true"});
    // The NOde.js SDK has a bug so it cannot create a Number tab at this time.
    //number1 = docusign.Number.constructFromObject({
    //    tabLabel: "numbersOnly", value: '54321'});
    let radioGroup = docusign.RadioGroup.constructFromObject({
            groupName: "radio1",
            // You only need to provide the radio entry for the entry you're selecting
            radios:
                [docusign.Radio.constructFromObject({value: "white", selected: "true"})]
    });
    let text = docusign.Text.constructFromObject({
            tabLabel: "text", value: "Jabberwocky!"});

    // We can also add a new tab (field) to the ones already in the template:
    let textExtra = docusign.Text.constructFromObject({
            document_id: "1", page_number: "1",
            x_position: "280", y_position: "172",
            font: "helvetica", font_size: "size14", tab_label: "added text field",
            height: "23", width: "84", required: "false",
            bold: 'true', value: args.signerName,
            locked: 'false', tab_id: 'name'});

    // Pull together the existing and new tabs in a Tabs object:
    let tabs = docusign.Tabs.constructFromObject({
        checkboxTabs: [check1, check3], // numberTabs: [number1],
        radioGroupTabs: [radioGroup], textTabs: [text, textExtra],
        listTabs: [list1]
    });
    // Create the template role elements to connect the signer and cc recipients
    // to the template
    let signer = docusign.TemplateRole.constructFromObject({
            email: args.signerEmail, name: args.signerName,
            roleName: 'signer',
            clientUserId: args.signerClientId, // change the signer to be embedded
            tabs: tabs // Set tab values
    });
    // Create a cc template role.
    let cc = docusign.TemplateRole.constructFromObject({
            email: args.ccEmail, name: args.ccName,
            roleName: 'cc'
    });
    // Add the TemplateRole objects to the envelope object
    envelopeDefinition.templateRoles = [signer, cc];
    // Create an envelope custom field to save the our application's
    // data about the envelope
    let customField = docusign.TextCustomField.constructFromObject({
            name: 'app metadata item',
            required: 'false',
            show: 'true', // Yes, include in the CoC
            value: '1234567'})
      , customFields = docusign.CustomFields.constructFromObject({
            textCustomFields: [customField]});
    envelopeDefinition.customFields = customFields;

    return envelopeDefinition;
}
// ***DS.snippet.0.end

/**
 * Form page for this application
 */
eg017SetTemplateTabValues.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        res.render('pages/examples/eg017SetTemplateTabValues', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Set template tab values",
            templateOk: req.session.templateId,
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
