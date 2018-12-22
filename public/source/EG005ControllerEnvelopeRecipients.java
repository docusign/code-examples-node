package com.docusign.controller.examples;

import com.docusign.esign.api.EnvelopesApi;
import com.docusign.esign.client.ApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpSession;
import java.io.IOException;
@Controller
@RequestMapping("/eg005")
public class EG005ControllerEnvelopeRecipients extends EGController {

    @Autowired
    HttpSession session;

    @Override
    protected void addSpecialAttributes(ModelMap model) {
        model.addAttribute("envelopeOk", session.getAttribute("envelopeId") != null);
    }


    @Override
    protected String getEgName() {
        return "eg005";
    }

    @Override
    protected String getTitle() {
        return "List envelope recipients";
    }

    @Override
    protected String getResponseTitle() {
        return "List envelope recipients result";
    }

    @Override
    protected Object doWork(WorkArguments args, ModelMap model) throws ApiException, IOException {
        EnvelopesApi envelopesApi = new EnvelopesApi(sessionApiClient);
        setMessage("Results from the EnvelopeRecipients::list method:");
        return envelopesApi.listRecipients(args.getAccountId(), args.getEnvelopeId());
    }
}
