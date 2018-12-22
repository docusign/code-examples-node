    protected Object doWork(WorkArguments args, ModelMap model) throws ApiException, IOException {
        // Step 1. Create the envelope definition
        EnvelopeDefinition envelope = makeEnvelope(args.getSignerEmail(), args.getSignerName());

        // Step 2. Call DocuSign to create the envelope
        EnvelopesApi envelopesApi = new EnvelopesApi(sessionApiClient);
        EnvelopeSummary results = envelopesApi.createEnvelope(args.getAccountId(), envelope);

        String envelopeId = results.getEnvelopeId();

        // Save for future use within the example launcher
        session.setAttribute("envelopeId", envelopeId);
        args.setEnvelopeId(envelopeId);

        // Step 3. create the recipient view, the Signing Ceremony
        RecipientViewRequest viewRequest = makeRecipientViewRequest(args.getSignerEmail(), args.getSignerName());
        // call the CreateRecipientView API
        ViewUrl results1 = envelopesApi.createRecipientView(args.getAccountId(), envelopeId, viewRequest);

        // Step 4. Redirect the user to the Signing Ceremony
        // Don't use an iFrame!
        // State can be stored/recovered using the framework's session or a
        // query parameter on the returnUrl (see the makeRecipientViewRequest method)
        args.setRedirectUrl("redirect:"+results1.getUrl());

        return null;
    }

    private RecipientViewRequest makeRecipientViewRequest(String signerEmail, String signerName) {
        RecipientViewRequest viewRequest = new RecipientViewRequest();
        // Set the url where you want the recipient to go once they are done signing
        // should typically be a callback route somewhere in your app.
        // The query parameter is included as an example of how
        // to save/recover state information during the redirect to
        // the DocuSign signing ceremony. It's usually better to use
        // the session mechanism of your web framework. Query parameters
        // can be changed/spoofed very easily.
        viewRequest.setReturnUrl(dsReturnUrl + "?state=123");

        // How has your app authenticated the user? In addition to your app's
        // authentication, you can include authenticate steps from DocuSign.
        // Eg, SMS authentication
        viewRequest.setAuthenticationMethod("none");

        // Recipient information must match embedded recipient info
        // we used to create the envelope.
        viewRequest.setEmail(signerEmail);
        viewRequest.setUserName(signerName);
        viewRequest.setClientUserId(signerClientId);

        // DocuSign recommends that you redirect to DocuSign for the
        // Signing Ceremony. There are multiple ways to save state.
        // To maintain your application's session, use the pingUrl
        // parameter. It causes the DocuSign Signing Ceremony web page
        // (not the DocuSign server) to send pings via AJAX to your
        // app,
        viewRequest.setPingFrequency("600"); // seconds
        // NOTE: The pings will only be sent if the pingUrl is an https address
        viewRequest.setPingUrl(dsPingUrl); // optional setting

        return viewRequest;
    }

    private EnvelopeDefinition makeEnvelope(String signerEmail, String signerName) throws IOException {
        byte[] buffer = readFile(config.docPdf);

        EnvelopeDefinition envelopeDefinition = new EnvelopeDefinition();
        envelopeDefinition.setEmailSubject("Please sign this document");
        Document doc1 = new Document();

        String doc1b64 = new String(Base64.encode(buffer));

        doc1.setDocumentBase64(doc1b64);
        doc1.setName("Lorem Ipsum"); // can be different from actual file name
        doc1.setFileExtension("pdf");
        doc1.setDocumentId("3");

        // The order in the docs array determines the order in the envelope
        envelopeDefinition.setDocuments(Arrays.asList(doc1));

        // Create a signer recipient to sign the document, identified by name and email
        // We set the clientUserId to enable embedded signing for the recipient
        // We're setting the parameters via the object creation
        Signer signer1 = new Signer();
        signer1.setEmail(signerEmail);
        signer1.setName(signerName);
        signer1.clientUserId(signerClientId);
        signer1.recipientId("1");

        // Create signHere fields (also known as tabs) on the documents,
        // We're using anchor (autoPlace) positioning
        //
        // The DocuSign platform seaches throughout your envelope's
        // documents for matching anchor strings.
        SignHere signHere1 = new SignHere();
        signHere1.setAnchorString("/sn1/");
        signHere1.setAnchorUnits("pixels");
        signHere1.setAnchorYOffset("20");
        signHere1.setAnchorXOffset("10");

        // Tabs are set per recipient / signer
        Tabs signer1Tabs = new Tabs();
        signer1Tabs.setSignHereTabs(Arrays.asList(signHere1));
        signer1.setTabs(signer1Tabs);

        // Add the recipient to the envelope object
        Recipients recipients = new Recipients();
        recipients.setSigners(Arrays.asList(signer1));
        envelopeDefinition.setRecipients(recipients);

        // Request that the envelope be sent by setting |status| to "sent".
        // To request that the envelope be created as a draft, set to "created"
        envelopeDefinition.setStatus("sent");

        return envelopeDefinition;
    }
