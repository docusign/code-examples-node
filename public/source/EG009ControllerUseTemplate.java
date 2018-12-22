package com.docusign.controller.examples;

import com.docusign.esign.api.EnvelopesApi;
import com.docusign.esign.client.ApiException;
import com.docusign.esign.model.EnvelopeDefinition;
import com.docusign.esign.model.EnvelopeSummary;
import com.docusign.esign.model.TemplateRole;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;

import java.io.IOException;
import java.util.Arrays;

@Controller
@RequestMapping("/eg009")
public class EG009ControllerUseTemplate extends EGController {

    private String message;

    @Override
    protected void addSpecialAttributes(ModelMap model) {
        model.addAttribute("templateOk", session.getAttribute("templateId") != null);
    }



    @Override
    protected String getResponseTitle() {
        return "Envelope sent";
    }

    @Override
    protected String getEgName() {
        return "eg009";
    }

    @Override
    protected String getTitle() {
        return "Send envelope using a template";
    }

    @Override
    protected Object doWork(WorkArguments args, ModelMap model) throws ApiException, IOException {
        EnvelopesApi envelopesApi = new EnvelopesApi(sessionApiClient);
        EnvelopeDefinition envelope = makeEnvelope(args);
        EnvelopeSummary result = envelopesApi.createEnvelope(args.getAccountId(), envelope);
        session.setAttribute("envelopeId", result.getEnvelopeId());
        setMessage("The envelope has been created and sent!<br/>Envelope ID " + result.getEnvelopeId() + ".");
        return result;
    }

    private EnvelopeDefinition makeEnvelope(WorkArguments args) {
        EnvelopeDefinition env = new EnvelopeDefinition();
        env.setTemplateId(args.getTemplateId());

        TemplateRole signer1 = new TemplateRole();
        signer1.setEmail(args.getSignerEmail());
        signer1.setName(args.getSignerName());
        signer1.setRoleName("signer");

        TemplateRole cc1 = new TemplateRole();
        cc1.setEmail(args.getCcEmail());
        cc1.setName(args.getCcName());
        cc1.setRoleName("cc");

        env.setTemplateRoles(Arrays.asList(signer1, cc1));
        env.setStatus("sent");
        return env;
    }
}
