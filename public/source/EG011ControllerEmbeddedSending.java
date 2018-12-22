package com.docusign.controller.examples;

import com.docusign.esign.api.EnvelopesApi;
import com.docusign.esign.client.ApiException;
import com.docusign.esign.model.EnvelopeDocumentsResult;
import com.docusign.esign.model.EnvelopeSummary;
import com.docusign.esign.model.ReturnUrlRequest;
import com.docusign.esign.model.ViewUrl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;

import java.io.IOException;

@Controller
@RequestMapping("/eg011")
public class EG011ControllerEmbeddedSending extends EGController {
    @Override
    protected void addSpecialAttributes(ModelMap model) {

    }

    @Override
    protected String getEgName() {
        return "eg011";
    }

    @Override
    protected String getTitle() {
        return "Signing request by email";
    }

    @Override
    protected String getResponseTitle() {
        return null;
    }

    @Autowired
    EG002ControllerSigningViaEmail controller2;

    @Override
    protected EnvelopeDocumentsResult doWork(WorkArguments args, ModelMap model) throws ApiException, IOException {
        EnvelopesApi envelopesApi = new EnvelopesApi(sessionApiClient);
        // Step 1. Make the envelope with "created" (draft) status
        args.setStatus("created");
        EnvelopeSummary results = (EnvelopeSummary) controller2.doWork(args, model);
        String envelopeId = results.getEnvelopeId();

        // Step 2. create the sender view
        // Call the CreateSenderView API
        // Exceptions will be caught by the calling function
        args.setDsReturnUrl(config.appUrl + "/ds-return");
        ReturnUrlRequest viewRequest = makeSenderViewRequest(args);

        ViewUrl result1 = envelopesApi.createSenderView(args.getAccountId(), envelopeId, viewRequest);
        // Switch to Recipient and Documents view if requested by the user
        String url = result1.getUrl();
        System.out.println("startingView: " + args.getStartingView());
        if ("recipient".equalsIgnoreCase(args.getStartingView())) {
            url = url.replace("send=1", "send=0");
        }

        System.out.println("Sender view URL: " + url);

        args.setRedirectUrl("redirect:" + url);

        return null;
    }

    private ReturnUrlRequest makeSenderViewRequest(WorkArguments args) {
        ReturnUrlRequest viewRequest = new ReturnUrlRequest();
        // Set the url where you want the recipient to go once they are done signing
        // should typically be a callback route somewhere in your app.
        // The query parameter is included as an example of how
        // to save/recover state information during the redirect to
        // the DocuSign signing ceremony. It's usually better to use
        // the session mechanism of your web framework. Query parameters
        // can be changed/spoofed very easily.
        viewRequest.setReturnUrl(args.getDsReturnUrl() + "?state=123");

        return viewRequest;
    }
}
