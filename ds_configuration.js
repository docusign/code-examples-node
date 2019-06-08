// ds_configuration.js -- configuration information
// Either fill in the data below or set the environment variables
//
exports.config = {
    dsClientId: process.env.DS_CLIENT_ID || '1f68be38-xxxx-xxxx-xxxx-de399bef22b1' // The app's DocuSign integration key
    , dsClientSecret: process.env.DS_CLIENT_SECRET || '45cebab4-xxxx-xxxx-xxxx-8bbe5ab49d49' // The app's DocuSign integration key's secret
    , signerEmail: process.env.DS_SIGNER_EMAIL || 'aaron.wilde@docusign.com'
    , signerName: process.env.DS_SIGNER_NAME || 'nodeJS user'
    , appUrl: process.env.DS_APP_URL || 'http://localhost:5000' // The url of the application. Eg http://localhost:5000
    // NOTE: You must add a Redirect URI of appUrl/ds/callback to your Integration Key.
    // Example: http://localhost:5000/ds/callback
    , production: false
    , debug: true // Send debugging statements to console
    , sessionSecret: '12345' // Secret for encrypting session cookie content
    , allowSilentAuthentication: true // a user can be silently authenticated if they have an 
    // active login session on another tab of the same browser
    , targetAccountId: null // Set if you want a specific DocuSign AccountId, If null, the user's default account will be used.
    , demoDocPath: 'demo_documents'
    , docDocx: 'World_Wide_Corp_Battle_Plan_Trafalgar.docx'
    , docPdf: 'World_Wide_Corp_lorem.pdf'
    // Payment gateway information is optional
    , gatewayAccountId: process.env.DS_PAYMENT_GATEWAY_ID || '{DS_PAYMENT_GATEWAY_ID}'
    , gatewayName: "stripe"
    , gatewayDisplayName: "Stripe"
    , githubExampleUrl: 'https://github.com/docusign/eg-03-node-auth-code-grant/tree/master/lib/examples/'
    , documentation: null
    //, documentation: 'https://developers.docusign.com/esign-rest-api/code-examples/'
    // Should source files for different software languages be shown?
    , multiSourceChooser: false
    , docOptions: [
    {langCode: 'csharp', name: 'C#',
    githubExampleUrl: 'https://github.com/docusign/eg-03-csharp-auth-code-grant-core/tree/master/eg-03-csharp-auth-code-grant-core/Controllers/',
    owner: 'docusign', repo: 'eg-03-csharp-auth-code-grant-core', pathPrefix: 'eg-03-csharp-auth-code-grant-core/Controllers/'
    },
    {langCode: 'php', name: 'PHP',
    githubExampleUrl: 'https://github.com/docusign/eg-03-php-auth-code-grant/blob/master/src/',
    owner: 'docusign', repo: 'eg-03-php-auth-code-grant', pathPrefix: 'src/'
    },
    {langCode: 'java', name: 'Java',
    githubExampleUrl: 'https://github.com/docusign/eg-03-java-auth-code-grant/tree/master/src/main/java/com/docusign/controller/examples/',
    owner: 'docusign', repo: 'eg-03-java-auth-code-grant', pathPrefix: 'src/main/java/com/docusign/controller/examples/'
    },
    {langCode: 'node', name: 'Node.js',
    githubExampleUrl: 'https://github.com/docusign/eg-03-node-auth-code-grant/tree/master/lib/examples/',
    owner: 'docusign', repo: 'eg-03-node-auth-code-grant', pathPrefix: 'lib/examples/'
    },
    {langCode: 'curl', name: 'API / curl',
    githubExampleUrl: 'https://github.com/docusign/eg-03-curl/tree/master/examples/',
    owner: 'docusign', repo: 'eg-03-curl', pathPrefix: 'examples/'
    },
    {langCode: 'python', name: 'Python',
    githubExampleUrl: 'https://github.com/docusign/eg-03-python-auth-code-grant/tree/master/app/',
    owner: 'docusign', repo: 'eg-03-python-auth-code-grant', pathPrefix: 'app/'
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
    , eg015: 'eg015EnvelopeTabData.js'
    , eg016: 'eg016SetTabValues.js'
    , eg017: 'eg017SetTemplateTabValues.js'
    , eg018: 'eg018EnvelopeCustomFieldData.js'
    , eg019: 'eg019AccessCodeAuthentication.js'
    , eg020: 'eg020SmsAuthentication.js'
    , eg021: 'eg021PhoneAuthentication.js'
    , eg022: 'eg022KbaAuthentication.js'
    , eg023: 'eg023IdvAuthentication.js'
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
    , eg014: 'EG014ControllerCollectPayment.java'
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
    },
    php: {
    eg001: 'EG001EmbeddedSigning.php'
    , eg002: 'EG002SigningViaEmail.php'
    , eg003: 'EG003ListEnvelopes.php'
    , eg004: 'EG004EnvelopeInfo.php'
    , eg005: 'EG005EnvelopeRecipients.php'
    , eg006: 'EG006EnvelopeDocs.php'
    , eg007: 'EG007EnvelopeGetDoc.php'
    , eg008: 'EG008CreateTemplate.php'
    , eg009: 'EG009UseTemplate.php'
    , eg010: 'EG010SendBinaryDocs.php'
    , eg011: 'EG011EmbeddedSending.php'
    , eg012: 'EG012EmbeddedConsole.php'
    , eg013: 'EG013AddDocToTemplate.php'
    //, eg014: 'EG014CollectPayment.php'
    , eg015: 'EG015EnvelopeTabData.php'
    , eg016: 'EG016SetTabValues.php'
    , eg017: 'EG017SetTemplateTabValues.php'
    , eg018: 'EG018EnvelopeCustomFieldData.php'
    },
    python: {
    eg001: 'eg001_embedded_signing.py'
    , eg002: 'eg002_signing_via_email.py'
    , eg003: 'eg003_list_envelopes.py'
    , eg004: 'eg004_envelope_info.py'
    , eg005: 'eg005_envelope_recipients.py'
    , eg006: 'eg006_envelope_docs.py'
    , eg007: 'eg007_envelope_get_doc.py'
    , eg008: 'eg008_create_template.py'
    , eg009: 'eg009_use_template.py'
    , eg010: 'eg010_send_binary_docs.py'
    , eg011: 'eg011_embedded_sending.py'
    , eg012: 'eg012_embedded_console.py'
    , eg013: 'eg013_add_doc_to_template.py'
    , eg014: 'eg014_collect_payment.py'
    },
    csharp: {
    eg001: 'Eg001EmbeddedSigningController.cs'
    , eg002: 'Eg002SigningViaEmailController.cs'
    , eg003: 'Eg003ListEnvelopesController.cs'
    , eg004: 'Eg004EnvelopeInfoController.cs'
    , eg005: 'Eg005EnvelopeRecipientsController.cs'
    , eg006: 'Eg006EnvelopeDocsController.cs'
    , eg007: 'Eg007EnvelopeGetDocController.cs'
    , eg008: 'Eg008CreateTemplateController.cs'
    , eg009: 'Eg009UseTemplateController.cs'
    , eg010: 'Eg010SendBinaryDocsController.cs'
    , eg011: 'Eg011EmbeddedSendingController.cs'
    , eg012: 'Eg012EmbeddedConsoleController.cs'
    , eg013: 'Eg013AddDocToTemplateController.cs'
    , eg014: 'Eg014CollectPaymentController.cs'
    }
    }
    // The gitHub settings are for the lib/utilities software.
    // They are reserved for use by DocuSign.
    , ghUserAgent: 'Example Source Updater'
    , gitHubAppId: 0
    , gitHubInstallationId: 0
    , gitHubPrivateKey: ``
    }
    exports.config.dsOauthServer = exports.config.production ?
    'https://account.docusign.com' : 'https://account-d.docusign.com';