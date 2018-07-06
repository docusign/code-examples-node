# Node Authorization Code Grant Examples

### Github repo: eg-03-node-auth-code-grant

## [Installation](#Installation)

## Introduction
This repo is a Node.JS application that demonstrates:

### Authorization Code Grant
This example enables the user to authenticate with DocuSign via the 
[Authorization Code Grant flow](https://developers.docusign.com/esign-rest-api/guides/authentication/oauth2-code-grant). 
When the token expires, the user is asked to re-authenticate. 
The **refresh token** is not used in this example. 

### Core Examples

#### Send an envelope with a remote (email) signer and cc recipient
The envelope includes three documents: a pdf, Word, and HTML document. 
Anchor text (Auto place) is used to position the signing fields in the documents.

API method used: [Emvelopes::create](https://developers.docusign.com/esign-rest-api/guides/authentication/oauth2-code-grant)

#### List envelopes in the user's account
The example lists the user's envelopes created in the last 30 days.

API method used: [Envelopes::listStatusChanges](https://developers.docusign.com/esign-rest-api/reference/Envelopes/Envelopes/listStatusChanges)

#### Get an envelope's core information
The example lists the core information about an envelope, including its overall status.
Additional API/SDK methods are used to get additional information about the 
envelope, its documents, recipients, etc.

API method used: [Envelopes::get](https://developers.docusign.com/esign-rest-api/reference/Envelopes/Envelopes/get)

#### List an envelope's recipients
The example lists the envelope's recpipients, including their current status

API method used: [EnvelopeRecipients::list](https://developers.docusign.com/esign-rest-api/reference/Envelopes/EnvelopeRecipients/list)

Auth Code Grant: list envelope docs, download docs
Auth Code Grant: Create a template
Auth Code Grant: Send envelope using a template
Auth Code Grant: Composite templates eg 1
Auth Code Grant: Embedded Signing Ceremony
Auth Code Grant: Embedded Sending
Auth Code Grant: Embedded DocuSign console

## Installation
[Authorization Code Grant flow](https://developers.docusign.com/esign-rest-api/guides/authentication/oauth2-code-grant). 
When the token expires, the user is asked to re-authenticate. 
The **refresh token** is not used in this example. 

### Core Examples

#### Send an envelope with a remote (email) signer and cc recipient
The envelope includes three documents: a pdf, Word, and HTML document. 
Anchor text (Auto place) is used to position the signing fields in the documents.

API method used: [Emvelopes::create](https://developers.docusign.com/esign-rest-api/guides/authentication/oauth2-code-grant)

#### List envelopes in the user's account
The example lists the user's envelopes created in the last 30 days.

API method used: [Envelopes::listStatusChanges](https://developers.docusign.com/esign-rest-api/reference/Envelopes/Envelopes/listStatusChanges)

#### Get an envelope's core information
The example lists the core information about an envelope, including its overall status.
Additional API/SDK methods are used to get additional information about the 
envelope, its documents, recipients, etc.

API method used: [Envelopes::get](https://developers.docusign.com/esign-rest-api/reference/Envelopes/Envelopes/get)

#### List an envelope's recipients
The example lists the envelope's recpipients, including their current status

API method used: [EnvelopeRecipients::list](https://developers.docusign.com/esign-rest-api/reference/Envelopes/EnvelopeRecipients/list)

Auth Code Grant: list envelope docs, download docs
Auth Code Grant: Create a template
Auth Code Grant: Send envelope using a template
Auth Code Grant: Composite templates eg 1
Auth Code Grant: Embedded Signing Ceremony
Auth Code Grant: Embedded Sending
Auth Code Grant: Embedded DocuSign console

