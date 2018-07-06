# Node.JS: Authorization Code Grant Examples

### Github repo: eg-03-node-auth-code-grant

## Contents
* [Introduction](#introduction)
* [Installation](#installation)
* [Using the examples with other authentication flows](#using-the-examples-with-other-authentication-flows)
* [License and additional information](#license-and-additional-information)

## Introduction
This repo is a Node.JS application that demonstrates the following:

### Authorization Code Grant
This example enables the user to authenticate with DocuSign via the 
[Authorization Code Grant flow](https://developers.docusign.com/esign-rest-api/guides/authentication/oauth2-code-grant). 
When the token expires, the user is asked to re-authenticate. 
The **refresh token** is not used in this example. 

### Core Examples

#### Embedded Signing Ceremony
This example sends an envelope, and then uses an embedded signing ceremony for the first signer.
With embedded signing, the DocuSign signing ceremony is initiated from your website. 

API methods used: [Envelopes::create](https://developers.docusign.com/esign-rest-api/reference/Envelopes/Envelopes/create) and
[EnvelopeViews::createRecipient](https://developers.docusign.com/esign-rest-api/reference/Envelopes/EnvelopeViews/createRecipient)


#### Send an envelope with a remote (email) signer and cc recipient
The envelope includes a pdf, Word, and HTML document. 
Anchor text ([AutoPlace](https://support.docusign.com/en/guides/AutoPlace-New-DocuSign-Experience)) 
is used to position the signing fields in the documents.

API method used: [Envelopes::create](https://developers.docusign.com/esign-rest-api/reference/Envelopes/Envelopes/create)

#### List envelopes in the user's account
The example lists the user's envelopes created in the last 30 days.

API method used: [Envelopes::listStatusChanges](https://developers.docusign.com/esign-rest-api/reference/Envelopes/Envelopes/listStatusChanges)

#### Get an envelope's core information
The example lists the core information about an envelope, including its overall status.
Additional API/SDK methods may be used to get additional information about the 
envelope, its documents, recipients, etc.

API method used: [Envelopes::get](https://developers.docusign.com/esign-rest-api/reference/Envelopes/Envelopes/get)

#### List an envelope's recipients
The example lists the envelope's recipients, including their current status.

API method used: [EnvelopeRecipients::list](https://developers.docusign.com/esign-rest-api/reference/Envelopes/EnvelopeRecipients/list)

#### List and download an envelope's documents
This example lists and then downloads an envelope's documents from DocuSign to  
a local directory on the server. 
They are not downloaded to the browser. 

API methods used: [EnvelopeDocuments::list](https://developers.docusign.com/esign-rest-api/reference/Envelopes/EnvelopeDocuments/list)
and [EnvelopeDocuments::get](https://developers.docusign.com/esign-rest-api/reference/Envelopes/EnvelopeDocuments/get)

#### Create a template
This example creates a template programmatically. 
The template will include three documents and two roles: `signer` and `cc`.

API method used: [Templates::create](https://developers.docusign.com/esign-rest-api/reference/Templates/Templates/create)

#### Send an envelope using a template
This example sends an envelope using a template. The template created with the **Create a template** example 
(immediately above) will be used. A common pattern for integrating DocuSign is to enable
the members of a business department to maintain and update a template by using the DocuSign web application.
Then your SDK application can use the template when it programmatically sends envelopes.

API method used: [Envelopes::create](https://developers.docusign.com/esign-rest-api/reference/Envelopes/Envelopes/create)

### Envelope Content

These examples demonstrate different techniques for updating an envelope's content.

#### Replacing a template's document
This example demonstrates how to create an envelope which uses all of the settings of a template,
except that a document in the template is replaced with a different document.

API method used: [Envelopes::create](https://developers.docusign.com/esign-rest-api/reference/Envelopes/Envelopes/create)

### Embedding the DocuSign webtool

#### Embedded Sending
This example creates an envelope and then opens the DocuSign sending view for the envelope. 
The sender can use the DocuSign web tool to add or update recipients, document fields (tabs),
and make other changes to the envelope. After the envelope has been sent, the user will be
redirected back to your application.

API method used: [EnvelopeViews::createSender](https://developers.docusign.com/esign-rest-api/reference/Envelopes/EnvelopeViews/createSender)

#### Embedded DocuSign console
This example redirects your application's user to the DocuSign console, the New DocuSign Signing Experience.
The user is not redirected back to your application.

API method used: [EnvelopeViews::createConsole](https://developers.docusign.com/esign-rest-api/reference/Envelopes/EnvelopeViews/createConsole)

## Installation

### Prerequisites
1. A DocuSign Developer Sandbox account (email and password) on [demo.docusign.net](https://demo.docusign.net).
   Create a [free account](https://go.docusign.com/o/sandbox/)
1. A DocuSign Integration Key (a client ID) that is configured to use the OAuth Authorization Code flow.
   You will need the **Integration Key** itself, and its **secret**.

   The Integration key must include a **Redirect URI** of `http://localhost:3000/ds/callback` 
   If you will not be running the example on your own workstation, use the appropriate DNS name and port instead of `localhost`
   
   This three minute **video** shows how to create an Integration Key for the Authorization Code Grant flow.
1. Node.JS v8.10 or later and NPM v5 or later.
1. A name and email for a signer, and a name and email for a cc recipient. 
   The signer and the cc information cannot be the same, but if just the names are different, that is ok.

### Installation steps
1. Download or clone this repository to your workstation to directory **eg-03-node-auth-code-grant**
1. **cd eg-03-node-auth-code-grant**
1. **npm install**
1. *Either:*
   
   * Update the file **ds_configuration.js** in the project's root directory with the Integration Key
     and other settings, *or*
   * Create and export environment variables for the settings. See the **ds_configuration.js** file 
     for the names of the environment variables.

1. **npm start** 
1. Open a browser to **http://localhost:3000**

## Using the examples with other authentication flows

The examples in this repository can also be used with either the Implicit Grant or JWT flows. 
See the [Authentication guide](https://developers.docusign.com/esign-rest-api/guides/authentication)
for information on choosing the right authentication flow for your application.

## License and additional information

### License
This repository uses the MIT License. See the LICENSE file for more information.

### Pull Requests
Pull requests are welcomed. Pull requests will only be considered if their content
uses the MIT License.

 
