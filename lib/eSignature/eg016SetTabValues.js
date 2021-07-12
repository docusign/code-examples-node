/**
 * @file
 * Example 016: Set optional and locked field values and an envelope custom field value
 * @author DocuSign
 */

const path = require('path')
    , fs = require('fs-extra')
    , docusign = require('docusign-esign')
    , validator = require('validator')
    , dsConfig = require('../../config/index.js').config
    ;

const eg016SetTabValues = exports
    , eg = 'eg016' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    , signerClientId = 1000 // The id of the signer within this application.
    , dsReturnUrl = dsConfig.appUrl + '/ds-return'
    ;


/**
 * Set tab values
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg016SetTabValues.createController = async (req, res) => {
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

    // Step 2. Call the worker method
    let body = req.body
        // Additional data validation might also be appropriate
      , signerEmail = validator.escape(body.signerEmail)
      , signerName = validator.escape(body.signerName)
      , envelopeArgs = {
            signerEmail: signerEmail,
            signerName: signerName,
            signerClientId: signerClientId,
            dsReturnUrl: dsReturnUrl
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
        results = await eg016SetTabValues.worker (args)
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
 * This function does the work of creating the envelope and the
 * embedded signing
 * @param {object} args
 */
// ***DS.snippet.0.start
eg016SetTabValues.worker = async (args) => {
    // Data for this method
    // args.basePath
    // args.accessToken
    // args.accountId
    // args.envelopeArgs.signerEmail
    // args.envelopeArgs.signerName
    // args.envelopeArgs.signerClientId
    // args.envelopeArgs.dsReturnUrl


    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(args.basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    let envelopesApi = new docusign.EnvelopesApi(dsApiClient)
      , results = null
      , envelopeArgs = args.envelopeArgs;

    // Step 1. Make the envelope request body
    let envelope = makeEnvelope(envelopeArgs)

    // Step 2. call Envelopes::create API method
    // Exceptions will be caught by the calling function
    results = await envelopesApi.createEnvelope(args.accountId, {envelopeDefinition: envelope});
    let envelopeId = results.envelopeId;
    console.log(`Envelope was created. EnvelopeId ${envelopeId}`);

    // Step 3. create the recipient view, the embedded signing
    let viewRequest = docusign.RecipientViewRequest.constructFromObject({
            returnUrl: envelopeArgs.dsReturnUrl,
            authenticationMethod: 'none',
            email: envelopeArgs.signerEmail,
            userName: envelopeArgs.signerName,
            clientUserId: envelopeArgs.signerClientId});

    // Step 4. Call the CreateRecipientView API
    // Exceptions will be caught by the calling function
    results = await envelopesApi.createRecipientView(args.accountId, envelopeId,
        {recipientViewRequest: viewRequest});

    return ({envelopeId: envelopeId, redirectUrl: results.url})
}

/**
 * Creates envelope
 * @function
 * @param {Object} args parameters for the envelope:
 * @returns {Envelope} An envelope definition
 * @private
 */
function makeEnvelope(args){
    // Data for this method
    // args.signerEmail
    // args.signerName
    // args.signerClientId


    // document 1 (docx) has tags
    // /sn1/ - signature field
    // /salary/ - yearly salary
    // /legal/ - legal name
    // /familiar/ - person's familiar name
    //
    // The envelope has one recipient.
    // recipient 1 - signer
    //
    // The salary is set both as a readable number in the
    // /salary/ text field, and as a pure number in a
    // custom field ('salary') in the envelope.

    // Salary that will be used.
    let salary = 123000;

    // read file from a local directory
    // The read could raise an exception if the file is not available!
    let demoDocsPath = path.resolve(__dirname, '../../demo_documents')
      , docName = 'World_Wide_Corp_salary.docx'
      , docBytes = fs.readFileSync(path.resolve(demoDocsPath, docName))
      , doc1b64 = Buffer.from(docBytes).toString('base64')
        // create the document model
      , document = docusign.Document.constructFromObject({
            documentBase64: doc1b64,
            name: 'Lorem Ipsum', // can be different from actual file name
            fileExtension: 'docx',
            documentId: '1'
        })
        // Create a signer recipient to sign the document, identified by name and email
        // We set the clientUserId to enable embedded signing for the recipient
      , signer = docusign.Signer.constructFromObject({
            email: args.signerEmail,
            name: args.signerName,
            clientUserId: args.signerClientId,
            recipientId: 1
        })
        // Create signHere field (also known as tabs) on the document,
      , signHere = docusign.SignHere.constructFromObject({
            anchorString: '/sn1/', anchorUnits: 'pixels',
            anchorYOffset: '10', anchorXOffset: '20'
        })
        // Create the legal and familiar text fields.
        // Recipients can update these values if they wish to.
      , textLegal = docusign.Text.constructFromObject({
            anchorString: '/legal/', anchorUnits: 'pixels',
            anchorYOffset: '-9', anchorXOffset: '5',
            font: 'helvetica', fontSize: 'size11',
            bold: 'true', value: args.signerName,
            locked: 'false', tabId: 'legal_name',
            tabLabel: 'Legal name'
        })
      , textFamiliar = docusign.Text.constructFromObject({
            anchorString: '/familiar/', anchorUnits: 'pixels',
            anchorYOffset: '-9', anchorXOffset: '5',
            font: 'helvetica', fontSize: 'size11',
            bold: 'true', value: args.signerName,
            locked: 'false', tabId: 'familiar_name',
            tabLabel: 'Familiar name'
        })
        // Create the salary field. It should be human readable, so
        // add a comma before the thousands number, a currency indicator, etc.
      , usFormat = new Intl.NumberFormat('en-US',
          {style: 'currency', currency: 'USD', minimumFractionDigits: 0})
      , salaryReadable = usFormat.format(salary)
      , textSalary = docusign.Text.constructFromObject({
            anchorString: '/salary/', anchorUnits: 'pixels',
            anchorYOffset: '-9', anchorXOffset: '5',
            font: 'helvetica', fontSize: 'size11',
            bold: 'true', value: salaryReadable,
            locked: 'true', // mark the field as readonly
            tabId: 'salary', tabLabel: 'Salary'
        })
      ;

    // Add the tabs model (including the sign_here tab) to the signer.
    // The Tabs object wants arrays of the different field/tab types
    signer.tabs = docusign.Tabs.constructFromObject({
        signHereTabs: [signHere],
        textTabs: [textLegal, textFamiliar, textSalary]
    });

    // Create an envelope custom field to save the "real" (numeric)
    // version of the salary
    salaryCustomField = docusign.TextCustomField.constructFromObject({
        name: 'salary',
        required: 'false',
        show: 'true', // Yes, include in the CoC
        value: salary
    });
    customFields = docusign.CustomFields.constructFromObject({
        textCustomFields: [salaryCustomField]
    });

    // Next, create the top level envelope definition and populate it.
    envelopeDefinition = docusign.EnvelopeDefinition.constructFromObject({
        emailSubject: "Please sign this salary document",
        documents: [document],
        // The Recipients object wants arrays for each recipient type
        recipients: docusign.Recipients.constructFromObject({signers: [signer]}),
        status: "sent", // requests that the envelope be created and sent.
        customFields: customFields
    });

    return envelopeDefinition;
}
// ***DS.snippet.0.end


/**
 * Form page for this application
 */
eg016SetTabValues.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        res.render('pages/examples/eg016SetTabValues', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Use embedded signing",
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
