// ds_configuration.js -- configuration information
// Either fill in the data below or set the environment variables
//
exports.config = {
    dsClientId: process.env.DS_CLIENT_ID || '{CLIENT_ID}' // The app's DocuSign integration key
  , dsClientSecret: process.env.DS_CLIENT_SECRET || '{CLIENT_SECRET}' // The app's DocuSign integration key's secret
  , signerEmail: process.env.DS_SIGNER_EMAIL || '{USER_EMAIL}'
  , signerName: process.env.DS_SIGNER_NAME || '{USER_FULLNAME}'
  , appUrl: process.env.DS_APP_URL || '{APP_URL}' // The url of the application. Eg http://localhost:5000
    // NOTE: You must add a Redirect URI of appUrl/ds/callback to your Integration Key.
    //       Example: http://localhost:5000/ds/callback
  , production: false
  , debug: true // Send debugging statements to console
  , sessionSecret: '12345' // Secret for encrypting session cookie content
  , allowSilentAuthentication: true // a user can be silently authenticated if they have an 
    // active login session on another tab of the same browser

  , targetAccountId: null // Set if you want a specific DocuSign AccountId, If null, the user's default account will be used.
  , demoDocPath: 'demo_documents'
  , docDocx: 'World_Wide_Corp_Battle_Plan_Trafalgar.docx'
  , docPdf:  'World_Wide_Corp_lorem.pdf'
  // Payment gateway information is optional
  , gatewayAccountId: process.env.DS_PAYMENT_GATEWAY_ID || '{DS_PAYMENT_GATEWAY_ID}'
  , gatewayName: "stripe"
  , gatewayDisplayName: "Stripe"
  , githubExampleUrl: 'https://github.com/docusign/eg-03-node-auth-code-grant/tree/master/lib/examples/'
  , documentation: null
  //, documentation: 'https://developers.docusign.com/esign-rest-api/code-examples/'
  // Should source files for different software languages be shown?
  , multiSourceChooser: true
  , docOptions: [
      {langCode: 'node', name: 'Node.js',
          githubExampleUrl: 'https://github.com/docusign/eg-03-node-auth-code-grant/tree/master/lib/examples/',
      },
      {langCode: 'java', name: 'Java',
          githubExampleUrl: 'https://github.com/docusign/eg-03-java-auth-code-grant/tree/master/src/main/java/com/docusign/controller/examples/',
      },
      {langCode: 'curl', name: 'API / curl',
          githubExampleUrl: 'https://github.com/docusign/eg-03-curl/tree/master/examples/',
      },
  ]
  , docNames: {
      node: {
          eg001: 'eg001EmbeddedSigning.js'
          , eg002: 'eg002SigningViaEmail.js'
          , eg003: 'eg003ListEnvelopes.js'
          , eg004: 'eg004EnvelopeInfo.js'
          , eg005: 'eg005EnvelopeRecipients.js'
          , eg006: 'eg006EnvelopeDocs.js'
          , eg007: 'eg007EnvelopeGetDoc.js'
          , eg008: 'eg008CreateTemplate.js'
          , eg009: 'eg009UseTemplate.js'
          , eg010: 'eg010SendBinaryDocs.js'
          , eg011: 'eg011EmbeddedSending.js'
          , eg012: 'eg012EmbeddedConsole.js'
          , eg013: 'eg013AddDocToTemplate.js'
          , eg014: 'eg014CollectPayment.js'
      },
      java: {
          eg001: 'EG001ControllerEmbeddedSigning.java'
          , eg002: 'EG002ControllerSigningViaEmail.java'
          , eg003: 'EG003ControllerListEnvelopes.java'
          , eg004: 'EG004ControllerEnvelopeInfo.java'
          , eg005: 'EG005ControllerEnvelopeRecipients.java'
          , eg006: 'EG006ControllerEnvelopeDocs.java'
          , eg007: 'EG007ControllerEnvelopeGetDoc.java'
          , eg008: 'EG008ControllerCreateTemplate.java'
          , eg009: 'EG009ControllerUseTemplate.java'
          , eg010: 'EG010ControllerSendBinaryDocs.java'
          , eg011: 'EG011ControllerEmbeddedSending.java'
          , eg012: 'EG012ControllerEmbeddedConsole.java'
          , eg013: 'EG013ControllerAddDocToTemplate.java'
      },
      curl: {
          eg001: 'eg001EmbeddedSigning.sh'
          , eg002: 'eg002SigningViaEmail.sh'
          , eg003: 'eg003ListEnvelopes.sh'
          , eg004: 'eg004EnvelopeInfo.sh'
          , eg005: 'eg005EnvelopeRecipients.sh'
          , eg006: 'eg006EnvelopeDocs.sh'
          , eg007: 'eg007EnvelopeGetDoc.sh'
          , eg008: 'eg008CreateTemplate.sh'
          , eg009: 'eg009UseTemplate.sh'
          , eg010: 'eg010SendBinaryDocs.sh'
          , eg011: 'eg011EmbeddedSending.sh'
          , eg012: 'eg012EmbeddedConsole.sh'
          , eg013: 'eg013AddDocToTemplate.sh'
          , eg014: 'eg014CollectPayment.sh'
      }
  }
}

exports.config.dsOauthServer = exports.config.production ? 
  'https://account.docusign.com' : 'https://account-d.docusign.com';

