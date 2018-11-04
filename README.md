# Node.JS: Authorization Code Grant Examples

### Github repo: eg-03-node-auth-code-grant
## Introduction
This repo is a Node.JS application that demonstrates:

* Authentication with DocuSign via the
[Authorization Code Grant flow](https://developers.docusign.com/esign-rest-api/guides/authentication/oauth2-code-grant).
When the token expires, the user is asked to re-authenticate.
The **refresh token** is not used in this example.
1. **Embedded Signing Ceremony.**
   [Source.](https://github.com/docusign/eg-03-node-auth-code-grant/blob/master/lib/examples/eg001EmbeddedSigning.js)
   This example sends an envelope, and then uses an embedded signing ceremony for the first signer.
   With embedded signing, the DocuSign signing ceremony is initiated from your website.
1. **Send an envelope with a remote (email) signer and cc recipient.**
   [Source.](https://github.com/docusign/eg-03-node-auth-code-grant/blob/master/lib/examples/eg002SigningViaEmail.js)
   The envelope includes a pdf, Word, and HTML document.
   Anchor text ([AutoPlace](https://support.docusign.com/en/guides/AutoPlace-New-DocuSign-Experience)) is used to position the signing fields in the documents.
1. **List envelopes in the user's account.**
   [Source.](https://github.com/docusign/eg-03-node-auth-code-grant/blob/master/lib/examples/eg003ListEnvelopes.js)
1. **Get an envelope's basic information.**
   [Source.](https://github.com/docusign/eg-03-node-auth-code-grant/blob/master/lib/examples/eg004EnvelopeInfo.js)
   The example lists the basic information about an envelope, including its overall status.
1. **List an envelope's recipients** 
   [Source.](https://github.com/docusign/eg-03-node-auth-code-grant/blob/master/lib/examples/eg005EnvelopeRecipients.js)
   Includes current recipient status.
1. **List an envelope's documents.**
   [Source.](https://github.com/docusign/eg-03-node-auth-code-grant/blob/master/lib/examples/eg006EnvelopeDocs.js)
1. **Download an envelope's documents.** 
   [Source.](https://github.com/docusign/eg-03-node-auth-code-grant/blob/master/lib/examples/eg007EnvelopeGetDoc.js)
   The example can download individual
   documents, the documents concatenated together, or a zip file of the documents.
1. **Programmatically create a template.**
   [Source.](https://github.com/docusign/eg-03-node-auth-code-grant/blob/master/lib/examples/eg008CreateTemplate.js)
1. **Send an envelope using a template.**
   [Source.](https://github.com/docusign/eg-03-node-auth-code-grant/blob/master/lib/examples/eg009UseTemplate.js)
1. **Send an envelope and upload its documents with multpart binary transfer.**
   [Source.](https://github.com/docusign/eg-03-node-auth-code-grant/blob/master/lib/examples/eg010SendBinaryDocs.js)
   Binary transfer is 33% more efficient than using Base64 encoding.
1. **Embedded sending.**
   [Source.](https://github.com/docusign/eg-03-node-auth-code-grant/blob/master/lib/examples/eg011EmbeddedSending.js)
   Embeds the DocuSign web tool (NDSE) in your web app to finalize or update 
   the envelope and documents before they are sent.
1. **Embedded DocuSign web tool (NDSE).**
   [Source.](https://github.com/docusign/eg-03-node-auth-code-grant/blob/master/lib/examples/eg012EmbeddedConsole.js)
1. **Embedded Signing Ceremony from a template with an added document.**
   [Source.](https://github.com/docusign/eg-03-node-auth-code-grant/blob/master/lib/examples/eg013AddDocToTemplate.js)
   This example sends an envelope based on a template.
   In addition to the template's document(s), the example adds an
   additional document to the envelope by using the
   [Composite Templates](https://developers.docusign.com/esign-rest-api/guides/features/templates#composite-templates)
   feature.
1. **Payments example: an order form, with online payment by credit card.**
   [Source.](https://github.com/docusign/eg-03-node-auth-code-grant/blob/master/lib/examples/eg014CollectPayment.js)

## Installation

### Prerequisites
1. A DocuSign Developer Sandbox account (email and password) on [demo.docusign.net](https://demo.docusign.net).
   Create a [free account](https://go.docusign.com/o/sandbox/).
1. A DocuSign Integration Key (a client ID) that is configured to use the
   OAuth Authorization Code flow.
   You will need the **Integration Key** itself, and its **secret**.

   If you use this example on your own workstation,
   the Integration key must include a **Redirect URI** of `http://localhost:5000/ds/callback`

   If you will not be running the example on your own workstation,
   use the appropriate DNS name and port instead of `localhost`

1. Node.JS v8.10 or later and NPM v5 or later.
1. A name and email for a signer, and a name and email for a cc recipient.
   The signer and the cc email cannot be the same.

### Installation steps
1. Download or clone this repository to your workstation to directory **eg-03-node-auth-code-grant**
1. **cd eg-03-node-auth-code-grant**
1. **npm install**
1. *Either:*

   * Update the file **ds_configuration.js** in the project's root directory
     with the Integration Key
     and other settings, *or*
   * Create and export environment variables for the settings.
     See the **ds_configuration.js** file
     for the names of the environment variables.

   **Note:** Protect your Integration Key and secret--If you update
   the ds_configuration.js file, then you
   should ensure that it will not be stored in your source code
   repository.

1. **npm start**
1. Open a browser to **http://localhost:5000**

#### Payments code example
To use the payments example, create a 
test payments gateway for your developer sandbox account. 

See the PAYMENTS_INSTALLATION.md file for instructions.
   
Then add the payment gateway account id to the **ds_configuration.js** file.

## Using the examples with other authentication flows

The examples in this repository can also be used with either the
Implicit Grant or JWT OAuth flows.
See the [Authentication guide](https://developers.docusign.com/esign-rest-api/guides/authentication)
for information on choosing the right authentication flow for your application.

## License and additional information

### License
This repository uses the MIT License. See the LICENSE file for more information.

### Pull Requests
Pull requests are welcomed. Pull requests will only be considered if their content
uses the MIT License.
