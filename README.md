# Node Authorization Code Grant Examples

### Github repo: eg-03-node-auth-code-grant

## Contents
* [Introduction](#introduction)
* [Installation](#installation)

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

### Prerequisites
1. A DocuSign Developer Sandbox account (email and password) on [demo.docusign.net](https://demo.docusign.net).
   [Create a free account](https://go.docusign.com/o/sandbox/)
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
   
   1. Update the file **ds_configuration.js** in the project's root directory with the Integration Key
      and other settings, or
   1. Create and export environment variables for the settings. See the **ds_configuration.js** file 
      for the names of the environment variables.

1. **npm start** 
1. Open a browser to **http://localhost:3000**


 
