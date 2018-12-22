package com.docusign.controller.examples;

import com.docusign.esign.api.EnvelopesApi;
import com.docusign.esign.client.ApiException;
import com.docusign.model.OptionItem;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.ArrayList;

@Controller
@RequestMapping("/eg007")
public class EG007ControllerEnvelopeGetDoc extends EGController {
    @Autowired
    HttpSession session;

    @Override
    protected void addSpecialAttributes(ModelMap model) {
        model.addAttribute("envelopeOk", session.getAttribute("envelopeId") != null);
        boolean documentsOk = session.getAttribute("envelopeDocuments") != null;
        model.addAttribute("documentsOk", documentsOk);
        if (documentsOk == false) {
            return;
        }
        JSONObject envelopeDocuments = (JSONObject) session.getAttribute("envelopeDocuments");
        JSONArray documents = (JSONArray) envelopeDocuments.get("documents");

        ArrayList<OptionItem> documentOptions = new ArrayList<>();
        for (int i = 0; i < documents.length(); i++) {
            OptionItem doc = new OptionItem();

            doc.setText(documents.getJSONObject(i).getString("name"));
            doc.setDocumentId(documents.getJSONObject(i).getString("documentId"));
            documentOptions.add(doc);
        }

        model.addAttribute("documentOptions", documentOptions);
    }

    @Override
    protected String getEgName() {
        return "eg007";
    }

    @Override
    protected String getTitle() {
        return "Download a document";
    }

    @Override
    protected String getResponseTitle() {
        return null;
    }

    @Override
    protected Object doWork(WorkArguments args, ModelMap model) throws ApiException, IOException {
        EnvelopesApi envelopesApi = new EnvelopesApi(sessionApiClient);
        // Step 1. EnvelopeDocuments::get.
        // Exceptions will be caught by the calling function
        byte[] results = envelopesApi.getDocument(args.getAccountId(), args.getEnvelopeId(), args.getDocumentId());

        JSONArray documents = args.getEnvelopeDocuments().getJSONArray("documents");
        JSONObject docItem = find(documents, args.getDocumentId());

        String docName = docItem.getString("name");
        boolean hasPDFsuffix = docName.toUpperCase().endsWith(".PDF");
        boolean pdfFile = hasPDFsuffix;
        // Add .pdf if it's a content or summary doc and doesn't already end in .pdf
        String docType = docItem.getString("type");
        if (("content".equals(docType) || "summary".equals(docType)) && !hasPDFsuffix) {
            docName += ".pdf";
            pdfFile = true;
        }
        // Add .zip as appropriate
        if ("zip".equals(docType)) {
            docName += ".zip";
        }
        // Return the file information
        // See https://stackoverflow.com/a/30625085/64904
        String mimetype;
        if (pdfFile) {
            mimetype = "application/pdf";
        } else if ("zip".equals(docType)) {
            mimetype = "application/zip";
        } else {
            mimetype = "application/octet-stream";
        }
        args.setRedirectUrl(null);
        return new JSONObject()
                .put("mimetype", mimetype)
                .put("docName", docName)
                .put("fileBytes", results);
    }

    private JSONObject find(JSONArray documents, String documentId) {

        for (int i = 0; i < documents.length(); i++) {
            JSONObject item = documents.getJSONObject(i);
            if (item.getString("documentId").equalsIgnoreCase(documentId)) {
                return item;
            }
        }

        return null;
    }
}
