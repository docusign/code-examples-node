package com.docusign.controller.examples;

import com.docusign.esign.api.EnvelopesApi;
import com.docusign.esign.client.ApiException;
import com.docusign.esign.model.ConsoleViewRequest;
import com.docusign.esign.model.EnvelopeDocumentsResult;
import com.docusign.esign.model.ViewUrl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpSession;
import java.io.IOException;

@Controller
@RequestMapping("/eg012")
public class EG012ControllerEmbeddedConsole extends EGController {

    @Autowired
    private HttpSession session;

    @Override
    protected void addSpecialAttributes(ModelMap model) {
        model.addAttribute("envelopeOk", session.getAttribute("envelopeId") != null);
    }

    @Override
    protected String getEgName() {
        return "eg012";
    }

    @Override
    protected String getTitle() {
        return "Embedded DocuSign web tool";
    }

    @Override
    protected String getResponseTitle() {
        return null;
    }

    @Override
    protected EnvelopeDocumentsResult doWork(WorkArguments args, ModelMap model) throws ApiException, IOException {
        EnvelopesApi envelopesApi = new EnvelopesApi(sessionApiClient);

        args.setDsReturnUrl(config.appUrl + "/ds-return");
        ConsoleViewRequest viewRequest = makeConsoleViewRequest(args);
        // Step 1. create the NDSE view
        // Call the CreateSenderView API
        // Exceptions will be caught by the calling function
        ViewUrl results = envelopesApi.createConsoleView(args.getAccountId(), viewRequest);

        args.setRedirectUrl("redirect:" + results.getUrl());

        System.out.println("NDSE view URL: " + results.getUrl());

        return null;
    }

    private ConsoleViewRequest makeConsoleViewRequest(WorkArguments args) {

        ConsoleViewRequest viewRequest = new ConsoleViewRequest();
        // Set the url where you want the recipient to go once they are done
        // with the NDSE. It is usually the case that the
        // user will never "finish" with the NDSE.
        // Assume that control will not be passed back to your app.
        viewRequest.setReturnUrl(args.getDsReturnUrl());

        if ("envelope".equalsIgnoreCase(args.getStartingView()) && args.getEnvelopeId() != null) {
            viewRequest.setEnvelopeId(args.getEnvelopeId());
        }

        return viewRequest;
    }
}
