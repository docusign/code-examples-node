/**
 * @file
 * Example 013: Embedded Signing Ceremony from template with added document
 * @author DocuSign
 */

const path = require('path')
    , fs = require('fs-extra')
    , docusign = require('docusign-esign')
    , validator = require('validator')
    , dsConfig = require('../../ds_configuration.js').config
    ;

const eg013 = exports
    , eg = 'eg013' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    , signerClientId = 1000 // The id of the signer within this application.
    , demoDocsPath = path.resolve(__dirname, '../../demo_documents')
    , dsReturnUrl = dsConfig.appUrl + '/ds-return' 
    , dsPingUrl = dsConfig.appUrl + '/' // Url that will be pinged by the DocuSign Signing Ceremony via Ajax
    ;

/**
 * Form page for this application
 */
eg013.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuthCodeGrant.checkToken();
    if (tokenOK) {
        res.render('pages/examples/eg013', {
            csrfToken: req.csrfToken(), 
            title: "Embedded Signing Ceremony",
            templateOk: req.session.templateId,
            source: dsConfig.githubExampleUrl + path.basename(__filename),
            documentation: dsConfig.documentation + eg
        });
    } else {
        // Save the current operation so it will be resumed after authentication
        req.dsAuthCodeGrant.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
}  

/**
 * Create the envelope, the Signing Ceremony, and then redirect to the Signing Ceremony
 * @param {object} req Request obj 
 * @param {object} res Response obj
 */
eg013.createController = async (req, res) => {
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
    let body = req.body
        // Additional data validation might also be appropriate
      , signerEmail = validator.escape(body.signerEmail)
      , signerName = validator.escape(body.signerName)
      , ccEmail = validator.escape(body.ccEmail)
      , ccName = validator.escape(body.ccName)
      , item = validator.escape(body.item)
      , quantity = validator.isInt(body.quantity) && body.quantity

      , envelopeArgs = {
            templateId: req.session.templateId,
            signerEmail: signerEmail, 
            signerName: signerName, 
            signerClientId: signerClientId,
            ccEmail: ccEmail,
            ccName: ccName,
            item: item, 
            quantity: quantity,
            dsReturnUrl: dsReturnUrl,
            dsPingUrl: dsPingUrl
        }
      , accountId = req.dsAuthCodeGrant.getAccountId()
      , dsAPIclient = req.dsAuthCodeGrant.getDSApi()
      , args = {
            dsAPIclient: dsAPIclient,
            makePromise: req.dsAuthCodeGrant.makePromise, // this is a function
            accountId: accountId,
            envelopeArgs: envelopeArgs
        }
      , results = null
      ;

    try {
        results = await eg013.worker (args)
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
        // Redirect the user to the Signing Ceremony
        // Don't use an iFrame!
        // State can be stored/recovered using the framework's session or a
        // query parameter on the returnUrl (see the makeRecipientViewRequest method)
        res.redirect(results.redirectUrl);
    }
}

/**
 * This function does the work of creating the envelope and the 
 * embedded Signing Ceremony
 * @param {object} args An object with the following elements: <br/>
 *   <tt>dsAPIclient</tt>: The DocuSign API Client object, already set with an access token and base url <br/>
 *   <tt>makePromise</tt>: Function for promisfying an SDK method <br/>
 *   <tt>accountId</tt>: Current account Id <br/>
 *   <tt>envelopeArgs</tt>: envelopeArgs, an object with elements 
 *      <tt>templateId</tt>, <tt>item</tt>, <tt>quantity</tt>
 *      <tt>signerEmail</tt>, <tt>signerName</tt>, <tt>signerClientId</tt>
 *      <tt>ccEmail</tt>, <tt>ccName</tt>
 */
// ***DS.worker.start ***DS.snippet.1.start
eg013.worker = async (args) => { 
    let envelopesApi = new docusign.EnvelopesApi(args.dsAPIclient)
      , createEnvelopeP = args.makePromise(envelopesApi, 'createEnvelope')
      , results = null
      ;

    // Step 1. Make the envelope request body
    let envelope = makeEnvelope(args.envelopeArgs)

    // Step 2. call Envelopes::create API method
    // Exceptions will be caught by the calling function
    results = await createEnvelopeP(args.accountId, {envelopeDefinition: envelope});
    
    let envelopeId = results.envelopeId;
    console.log(`Envelope was created. EnvelopeId ${envelopeId}`);

    // Step 3. create the recipient view, the Signing Ceremony
    let viewRequest = makeRecipientViewRequest(args.envelopeArgs)
      , createRecipientViewP = args.makePromise(envelopesApi, 'createRecipientView')
      ;

    // Call the CreateRecipientView API
    // Exceptions will be caught by the calling function
    results = await createRecipientViewP(args.accountId, envelopeId,
        {recipientViewRequest: viewRequest});

    return ({envelopeId: envelopeId, redirectUrl: results.url})
}
// ***DS.worker.end ***DS.snippet.1.end

// ***DS.snippet.2.start
/**
 * Creates envelope
 * @function
 * @param {Object} args parameters for the envelope:
 *      <tt>templateId</tt>, <tt>item</tt>, <tt>quantity</tt>
 *      <tt>signerEmail</tt>, <tt>signerName</tt>, <tt>signerClientId</tt>
 *      <tt>ccEmail</tt>, <tt>ccName</tt>
 * @returns {Envelope} An envelope definition
 * @private
 */
function makeEnvelope(args){
    // The envelope request object uses Composite Template to 
    // include in the envelope:
    // 1. A template stored on the DocuSign service
    // 2. An additional document which is a custom HTML source document 
   
    // Create Recipients for server template. Note that Recipients object
    // is used, not TemplateRole
    //
    // Create a signer recipient for the signer role of the server template
    let signer1 = docusign.Signer.constructFromObject({
            email: args.signerEmail,
            name: args.signerName, 
            roleName: "signer",
            recipientId: "1",
            // Adding clientUserId transforms the template recipient
            // into an embedded recipient:
            clientUserId: args.signerClientId 
        });
    // Create the cc recipient
    let cc1 = docusign.CarbonCopy.constructFromObject({
        email: args.ccEmail,
        name: args.ccName, 
        roleName: "cc",
        recipientId: "2"
    });
    // Recipients object:
    let recipientsServerTemplate = docusign.Recipients.constructFromObject({
        carbonCopies: [cc1], signers: [signer1], });

    // create a composite template for the Server Template
    let compTemplate1 = docusign.CompositeTemplate.constructFromObject({
          compositeTemplateId: "1",
          serverTemplates: [
              docusign.ServerTemplate.constructFromObject({
                  sequence: "1",
                  templateId: args.templateId                   
              })
          ],
          // Add the roles via an inlineTemplate
          inlineTemplates: [
              docusign.InlineTemplate.constructFromObject({
                  sequence: "1",
                  recipients: recipientsServerTemplate
              })
          ]
    })

    // The signer recipient for the added document with
    // a tab definition:
    let signHere1 = docusign.SignHere.constructFromObject({
        anchorString: '**signature_1**',
        anchorYOffset: '10', anchorUnits: 'pixels',
        anchorXOffset: '20'})
    ;
    let signer1Tabs = docusign.Tabs.constructFromObject({
        signHereTabs: [signHere1]});

    // Signer definition for the added document
    let signer1AddedDoc = docusign.Signer.constructFromObject({
        email: args.signerEmail,
        name: args.signerName,
        clientId: args.signerClientId,
        roleName: "signer",
        recipientId: "1",
        tabs: signer1Tabs
    });
    // Recipients object for the added document:
    let recipientsAddedDoc = docusign.Recipients.constructFromObject({
        carbonCopies: [cc1], signers: [signer1AddedDoc]});
    // create the HTML document
    let doc1 = new docusign.Document()
      , doc1b64 = Buffer.from(document1(args)).toString('base64');
    doc1.documentBase64 = doc1b64;
    doc1.name = 'Appendix 1--Sales order'; // can be different from actual file name
    doc1.fileExtension = 'html';
    doc1.documentId = '1';

    // create a composite template for the added document
    let compTemplate2 = docusign.CompositeTemplate.constructFromObject({
        compositeTemplateId: "2",
        // Add the recipients via an inlineTemplate
        inlineTemplates: [
            docusign.InlineTemplate.constructFromObject({
                sequence: "2",
                recipients: recipientsAddedDoc
            })
        ],
        document: doc1
    })

    // create the envelope definition
    let env = docusign.EnvelopeDefinition.constructFromObject({
        status: "sent",
        compositeTemplates: [compTemplate1, compTemplate2]
    })

    return env;
}
// ***DS.snippet.2.end

// ***DS.snippet.3.start
/**
 * Creates document 1
 * @function
 * @private
 * @param {Object} args parameters for the envelope:
 *   <tt>signerEmail</tt>, <tt>signerName</tt>, <tt>ccEmail</tt>, <tt>ccName</tt>
 * @returns {string} A document in HTML format
 */

function document1(args) {
    return `
    <!DOCTYPE html>
    <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family:sans-serif;margin-left:2em;">
        <h1 style="font-family: 'Trebuchet MS', Helvetica, sans-serif;
            color: darkblue;margin-bottom: 0;">World Wide Corp</h1>
        <h2 style="font-family: 'Trebuchet MS', Helvetica, sans-serif;
          margin-top: 0px;margin-bottom: 3.5em;font-size: 1em;
          color: darkblue;">Order Processing Division</h2>
        <h4>Ordered by ${args.signerName}</h4>
        <p style="margin-top:0em; margin-bottom:0em;">Email: ${args.signerEmail}</p>
        <p style="margin-top:0em; margin-bottom:0em;">Copy to: ${args.ccName}, ${args.ccEmail}</p>
        <p style="margin-top:3em; margin-bottom:0em;">Item: <b>${args.item}</b>, quantity: <b>${args.quantity}</b> at market price.</p>
        <p style="margin-top:3em;">
  Candy bonbon pastry jujubes lollipop wafer biscuit biscuit. Topping brownie sesame snaps sweet roll pie. Croissant danish biscuit soufflé caramels jujubes jelly. Dragée danish caramels lemon drops dragée. Gummi bears cupcake biscuit tiramisu sugar plum pastry. Dragée gummies applicake pudding liquorice. Donut jujubes oat cake jelly-o. Dessert bear claw chocolate cake gummies lollipop sugar plum ice cream gummies cheesecake.
        </p>
        <!-- Note the anchor tag for the signature field is in white. -->
        <h3 style="margin-top:3em;">Agreed: <span style="color:white;">**signature_1**/</span></h3>
        </body>
    </html>
  `
  }
// ***DS.snippet.3.end


// ***DS.snippet.4.start
function makeRecipientViewRequest(args) {
    let viewRequest = new docusign.RecipientViewRequest();

    // Set the url where you want the recipient to go once they are done signing
    // should typically be a callback route somewhere in your app.
    // The query parameter is included as an example of how
    // to save/recover state information during the redirect to
    // the DocuSign signing ceremony. It's usually better to use
    // the session mechanism of your web framework. Query parameters
    // can be changed/spoofed very easily.
    viewRequest.returnUrl = args.dsReturnUrl + "?state=123";

    // How has your app authenticated the user? In addition to your app's
    // authentication, you can include authenticate steps from DocuSign.
    // Eg, SMS authentication
    viewRequest.authenticationMethod = 'none';
    
    // Recipient information must match embedded recipient info
    // we used to create the envelope.
    viewRequest.email = args.signerEmail;
    viewRequest.userName = args.signerName;
    viewRequest.clientUserId = args.signerClientId;

    // DocuSign recommends that you redirect to DocuSign for the
    // Signing Ceremony. There are multiple ways to save state.
    // To maintain your application's session, use the pingUrl
    // parameter. It causes the DocuSign Signing Ceremony web page
    // (not the DocuSign server) to send pings via AJAX to your
    // app,
    viewRequest.pingFrequency = 600; // seconds
    // NOTE: The pings will only be sent if the pingUrl is an https address
    viewRequest.pingUrl = args.dsPingUrl; // optional setting

    return viewRequest
}
// ***DS.snippet.4.end

