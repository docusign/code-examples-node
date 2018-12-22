package com.docusign.controller.examples;

import com.docusign.esign.api.EnvelopesApi;
import com.docusign.esign.api.EnvelopesApi.ListStatusChangesOptions;
import com.docusign.esign.client.ApiException;
import com.docusign.esign.model.EnvelopesInformation;
import org.joda.time.LocalDate;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;

import java.io.IOException;

@Controller
@RequestMapping("/eg003")
public class EG003ControllerListEnvelopes extends EGController {
    @Override
    protected void addSpecialAttributes(ModelMap model) {

    }

    @Override
    protected String getEgName() {
        return "eg003";
    }

    @Override
    protected String getTitle() {
        return "List envelopes";
    }

    @Override
    protected String getResponseTitle() {
        return "List envelopes results";
    }

    @Override
    protected Object doWork(WorkArguments args, ModelMap model) throws ApiException, IOException {

        EnvelopesApi envelopesApi = new EnvelopesApi(sessionApiClient);
        ListStatusChangesOptions options = envelopesApi.new ListStatusChangesOptions();

        LocalDate date = LocalDate.now().minusDays(30);
        options.setFromDate(date.toString("yyyy/MM/dd"));

        EnvelopesInformation results = envelopesApi.listStatusChanges(args.getAccountId(), options);
        setMessage("Results from the Envelopes::listStatusChanges method:");
        return results;
    }
}
