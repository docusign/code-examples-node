package com.docusign.controller.examples;

import com.docusign.esign.client.ApiException;
import com.docusign.esign.model.*;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.net.ssl.HttpsURLConnection;
import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.Arrays;
import java.util.List;

@Controller
@RequestMapping("/eg010")
public class EG010ControllerSendBinaryDocs extends EGController {

    @Override
    protected void addSpecialAttributes(ModelMap model) {

    }


    @Override
    protected String getEgName() {
        return "eg010";
    }

    @Override
    protected String getTitle() {
        return "Send envelope with multipart mime";
    }

    @Override
    protected String getResponseTitle() {
        return "Envelope sent";
    }

    @Override
    protected EnvelopeDocumentsResult doWork(WorkArguments args, ModelMap model) throws ApiException, IOException {
        // Step 1. Make the envelope JSON request body
        JSONObject envelopeJSON = makeEnvelopeJSON(args);
        Object results = null;

        // Step 2. Gather documents and their headers
        // Read files from a local directory
        // The reads could raise an exception if the file is not available!
        List<JSONObject> documents = Arrays.asList(
                createDocumentObject(envelopeJSON, "text/html",
                        document1(args).getBytes(), 0),
                createDocumentObject(envelopeJSON,
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        readFile(config.docDocx), 1),
                createDocumentObject(envelopeJSON, "application/pdf",
                        readFile(config.docPdf), 2)
        );

        // Step 3. Create the multipart body
        String CRLF = "\r\n", boundary = "multipartboundary_multipartboundary", hyphens = "--";

        URL uri = new URL(session.getAttribute("basePath")
                + "/v2/accounts/" + args.getAccountId() + "/envelopes");

        HttpsURLConnection connection = (HttpsURLConnection) uri.openConnection();
        connection.setRequestMethod("POST");
        connection.setRequestProperty("Accept", "application/json");
        connection.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);
        connection.setRequestProperty("Authorization", "Bearer " + user.getAccessToken());
        connection.setDoOutput(true);

        DataOutputStream buffer = new DataOutputStream(connection.getOutputStream());


        buffer.writeBytes(hyphens);
        buffer.writeBytes(boundary);
        buffer.writeBytes(CRLF);
        buffer.writeBytes("Content-Type: application/json");
        buffer.writeBytes(CRLF);
        buffer.writeBytes("Content-Disposition: form-data");
        buffer.writeBytes(CRLF);
        buffer.writeBytes(CRLF);
        buffer.writeBytes(envelopeJSON.toString(4));

        // Loop to add the documents.
        // See section Multipart Form Requests on page https://developers.docusign.com/esign-rest-api/guides/requests-and-responses
        for (JSONObject d : documents) {
            buffer.writeBytes(CRLF);
            buffer.writeBytes(hyphens);
            buffer.writeBytes(boundary);
            buffer.writeBytes(CRLF);
            buffer.writeBytes("Content-Type:" + d.getString("mime"));
            buffer.writeBytes(CRLF);
            buffer.writeBytes("Content-Disposition: file; filename=\"" + d.getString("filename") + ";documentid=" + d.getString("documentId"));
            buffer.writeBytes(CRLF);
            buffer.writeBytes(CRLF);
            buffer.write((byte[]) d.get("bytes"));
        }

        // Add closing boundary
        buffer.writeBytes(CRLF);
        buffer.writeBytes(hyphens);
        buffer.writeBytes(boundary);
        buffer.writeBytes(hyphens);
        buffer.writeBytes(CRLF);

        buffer.flush();

        int responseCode = connection.getResponseCode();
        System.out.println("Response Code : " + responseCode);

        BufferedReader in;
        if (responseCode >= 200 && responseCode < 300) {
            in = new BufferedReader(
                    new InputStreamReader(connection.getInputStream()));
        } else {
            in = new BufferedReader(
                    new InputStreamReader(connection.getErrorStream()));
        }

        String inputLine;
        StringBuffer response = new StringBuffer();

        while ((inputLine = in.readLine()) != null) {
            response.append(inputLine);
        }
        in.close();
        JSONObject obj = new JSONObject(response.toString());
        String envelopeId = obj.getString("envelopeId");
        session.setAttribute("envelopeId", envelopeId);
        setMessage("The envelope has been created and sent!<br/>Envelope ID " + envelopeId+".");

        return null;
    }

    private JSONObject createDocumentObject(JSONObject envelopeJSON, String mime, byte[] bytes, int index) {

        JSONObject doc = envelopeJSON.getJSONArray("documents").getJSONObject(index);

        return new JSONObject()
                .put("mime", mime)
                .put("filename", doc.getString("name"))
                .put("documentId", doc.getString("documentId"))
                .put("bytes", bytes);
    }

    private JSONObject makeEnvelopeJSON(WorkArguments args) {
        // document 1 (html) has tag **signature_1**
        // document 2 (docx) has tag /sn1/
        // document 3 (pdf) has tag /sn1/
        //
        // The envelope has two recipients.
        // recipient 1 - signer
        // recipient 2 - cc
        // The envelope will be sent first to the signer.
        // After it is signed, a copy is sent to the cc person.

        // create the envelope definition
        JSONObject envJSON = new JSONObject();
        envJSON.put("emailSubject", "Please sign this document set");

        // add the documents
        JSONObject doc1 = new JSONObject(), doc2 = new JSONObject(), doc3 = new JSONObject();

        doc1.put("name", "Order acknowledgement"); // can be different from actual file name
        doc1.put("fileExtension", "html"); // Source data format. Signed docs are always pdf.
        doc1.put("documentId", "1"); // a label used to reference the doc
        doc2.put("name", "Battle Plan"); // can be different from actual file name
        doc2.put("fileExtension", "docx");
        doc2.put("documentId", "2");
        doc3.put("name", "Lorem Ipsum"); // can be different from actual file name
        doc3.put("fileExtension", "pdf");
        doc3.put("documentId", "3");

        // The order in the docs array determines the order in the envelope
        envJSON.put("documents", new JSONArray()
                .put(doc1)
                .put(doc2)
                .put(doc3));

        // create a signer recipient to sign the document, identified by name and email
        // We're setting the parameters via the object creation
        Signer signer1 = new Signer();
        signer1.setEmail(args.getSignerEmail());
        signer1.setName(args.getSignerName());
        signer1.setRecipientId("1");
        signer1.setRoutingOrder("1");
        // routingOrder (lower means earlier) determines the order of deliveries
        // to the recipients. Parallel routing order is supported by using the
        // same integer as the order for two or more recipients.

        // create a cc recipient to receive a copy of the documents, identified by name and email
        // We're setting the parameters via setters
        CarbonCopy cc1 = new CarbonCopy();
        cc1.setEmail(args.getCcEmail());
        cc1.setName(args.getCcName());
        cc1.setRoutingOrder("2");
        cc1.recipientId("2");
        // Create signHere fields (also known as tabs) on the documents,
        // We're using anchor (autoPlace) positioning
        //
        // The DocuSign platform searches throughout your envelope's
        // documents for matching anchor strings. So the
        // signHere2 tab will be used in both document 2 and 3 since they
        // use the same anchor string for their "signer 1" tabs.
        SignHere signHere1 = new SignHere();
        signHere1.setAnchorString("**signature_1**");
        signHere1.setAnchorYOffset("10");
        signHere1.setAnchorUnits("pixels");
        signHere1.setAnchorXOffset("20");
        SignHere signHere2 = new SignHere();
        signHere2.setAnchorString("/sn1/");
        signHere2.setAnchorYOffset("10");
        signHere2.setAnchorUnits("pixels");
        signHere2.setAnchorXOffset("20");

        // Tabs are set per recipient / signer
        Tabs signer1Tabs = new Tabs();
        signer1Tabs.setSignHereTabs(Arrays.asList(signHere1, signHere2));
        signer1.setTabs(signer1Tabs);

        // Add the recipients to the envelope object
        Recipients recipients = new Recipients();
        recipients.setSigners(Arrays.asList(signer1));
        recipients.setCarbonCopies(Arrays.asList(cc1));

        envJSON.put("recipients", new JSONObject(recipients));

        // Request that the envelope be sent by setting |status| to "sent".
        // To request that the envelope be created as a draft, set to "created"
        envJSON.put("status", "sent");

        return envJSON;
    }

    private String document1(WorkArguments args) {
        return " <!DOCTYPE html>\n" +
                "    <html>\n" +
                "        <head>\n" +
                "          <meta charset=\"UTF-8\">\n" +
                "        </head>\n" +
                "        <body style=\"font-family:sans-serif;margin-left:2em;\">\n" +
                "        <h1 style=\"font-family: 'Trebuchet MS', Helvetica, sans-serif;\n" +
                "            color: darkblue;margin-bottom: 0;\">World Wide Corp</h1>\n" +
                "        <h2 style=\"font-family: 'Trebuchet MS', Helvetica, sans-serif;\n" +
                "          margin-top: 0px;margin-bottom: 3.5em;font-size: 1em;\n" +
                "          color: darkblue;\">Order Processing Division</h2>\n" +
                "        <h4>Ordered by " + args.getSignerName() + "</h4>\n" +
                "        <p style=\"margin-top:0em; margin-bottom:0em;\">Email: " + args.getSignerEmail() + "</p>\n" +
                "        <p style=\"margin-top:0em; margin-bottom:0em;\">Copy to: " + args.getCcName() + ", " + args.getCcEmail() + "</p>\n" +
                "        <p style=\"margin-top:3em;\">\n" +
                "  Candy bonbon pastry jujubes lollipop wafer biscuit biscuit. Topping brownie sesame snaps sweet roll pie. Croissant danish biscuit soufflé caramels jujubes jelly. Dragée danish caramels lemon drops dragée. Gummi bears cupcake biscuit tiramisu sugar plum pastry. Dragée gummies applicake pudding liquorice. Donut jujubes oat cake jelly-o. Dessert bear claw chocolate cake gummies lollipop sugar plum ice cream gummies cheesecake.\n" +
                "        </p>\n" +
                "        <!-- Note the anchor tag for the signature field is in white. -->\n" +
                "        <h3 style=\"margin-top:3em;\">Agreed: <span style=\"color:white;\">**signature_1**/</span></h3>\n" +
                "        </body>\n" +
                "    </html>";
    }
}
