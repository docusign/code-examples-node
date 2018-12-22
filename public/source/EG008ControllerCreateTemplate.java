package com.docusign.controller.examples;

import com.docusign.esign.api.TemplatesApi;
import com.docusign.esign.client.ApiException;
import com.docusign.esign.model.*;
import com.sun.jersey.core.util.Base64;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.Arrays;

@Controller
@RequestMapping("/eg008")
public class EG008ControllerCreateTemplate extends EGController {

    @Autowired
    protected HttpSession session;

    @Override
    protected void addSpecialAttributes(ModelMap model) {

    }

    @Override
    protected String getEgName() {
        return "eg008";
    }

    @Override
    protected String getTitle() {
        return "Create a template";
    }

    @Override
    protected String getResponseTitle() {
        return "Template results";
    }

    @Override
    protected EnvelopeDocumentsResult doWork(WorkArguments args, ModelMap model) throws ApiException, IOException {
        args.setTemplateName("Example Signer and CC template");
        TemplatesApi templatesApi = new TemplatesApi(sessionApiClient);
        TemplatesApi.ListTemplatesOptions options = templatesApi.new ListTemplatesOptions();
        options.setSearchText(args.getTemplateName());
        EnvelopeTemplateResults results = templatesApi.listTemplates(args.getAccountId(), options);

        String templateId;
        String resultsTemplateName;
        boolean createdNewTemplate;

        if (Integer.parseInt(results.getResultSetSize()) > 0) {
            EnvelopeTemplateResult template = results.getEnvelopeTemplates().get(0);
            templateId = template.getTemplateId();
            resultsTemplateName = template.getName();
            createdNewTemplate = false;
        } else {
            EnvelopeTemplate templateReqObject = makeTemplate(args);
            TemplateSummary template = templatesApi.createTemplate(args.getAccountId(), templateReqObject);
            templateId = template.getTemplateId();
            resultsTemplateName = template.getName();
            createdNewTemplate = true;
        }

        session.setAttribute("templateId", templateId);
        String msg = createdNewTemplate ?
                "The template has been created!" :
                "The template already exists in your account.";

        setMessage(msg + "<br/>Template name: " + resultsTemplateName + ", ID " + templateId + ".");

        return null;
    }

    private EnvelopeTemplate makeTemplate(WorkArguments args) throws IOException {
        // document 1 (pdf) has tag /sn1/
        //
        // The template has two recipient roles.
        // recipient 1 - signer
        // recipient 2 - cc
        // The template will be sent first to the signer.
        // After it is signed, a copy is sent to the cc person.
        // read file from a local directory
        // The reads could raise an exception if the file is not available!
        byte[] docPdfBytes = readFile("World_Wide_Corp_fields.pdf");
        // add the documents
        Document doc = new Document();
        String docB64 = new String(Base64.encode(docPdfBytes));
        doc.setDocumentBase64(docB64);
        doc.setName("Lorem Ipsum"); // can be different from actual file name
        doc.setFileExtension("pdf");
        doc.setDocumentId("1");

        // create a signer recipient to sign the document, identified by name and email
        // We're setting the parameters via the object creation
        Signer signer1 = new Signer();
        signer1.setRoleName("signer");
        signer1.setRecipientId("1");
        signer1.setRoutingOrder("1");
        // routingOrder (lower means earlier) determines the order of deliveries
        // to the recipients. Parallel routing order is supported by using the
        // same integer as the order for two or more recipients.

        // create a cc recipient to receive a copy of the documents, identified by name and email
        // We're setting the parameters via setters
        CarbonCopy cc1 = new CarbonCopy();
        cc1.setRoleName("cc");
        cc1.setRoutingOrder("2");
        cc1.setRecipientId("2");
        // Create fields using absolute positioning:
        SignHere signHere = new SignHere();
        signHere.setDocumentId("1");
        signHere.setPageNumber("1");
        signHere.setXPosition("191");
        signHere.setYPosition("148");

        Checkbox check1 = new Checkbox();
        check1.setDocumentId("1");
        check1.setPageNumber("1");
        check1.setXPosition("75");
        check1.setYPosition("417");
        check1.setTabLabel("ckAuthorization");

        Checkbox check2 = new Checkbox();
        check2.setDocumentId("1");
        check2.setPageNumber("1");
        check2.setXPosition("75");
        check2.setYPosition("447");
        check2.setTabLabel("ckAuthentication");

        Checkbox check3 = new Checkbox();
        check3.setDocumentId("1");
        check3.setPageNumber("1");
        check3.setXPosition("75");
        check3.setYPosition("478");
        check3.setTabLabel("ckAgreement");

        Checkbox check4 = new Checkbox();
        check4.setDocumentId("1");
        check4.setPageNumber("1");
        check4.setXPosition("75");
        check4.setYPosition("508");
        check4.setTabLabel("ckAcknowledgement");

        List list1 = new List();
        list1.setDocumentId("1");
        list1.setPageNumber("1");
        list1.setXPosition("142");
        list1.setYPosition("291");
        list1.setFont("helvetica");
        list1.setFontSize("size14");
        list1.setTabLabel("list");
        list1.setRequired("false");
        list1.setListItems(Arrays.asList(
                createListItem("Red"),
                createListItem("Orange"),
                createListItem("Yellow"),
                createListItem("Green"),
                createListItem("Blue"),
                createListItem("Indigo"),
                createListItem("Violet")
        ));
        // The SDK can't create a number tab at this time. Bug DCM-2732
        // Until it is fixed, use a text tab instead.
        //   , number = docusign.Number.constructFromObject({
        //         documentId: "1", pageNumber: "1", xPosition: "163", yPosition: "260",
        //         font: "helvetica", fontSize: "size14", tabLabel: "numbersOnly",
        //         height: "23", width: "84", required: "false"})
        Text textInsteadOfNumber = new Text();
        textInsteadOfNumber.setDocumentId("1");
        textInsteadOfNumber.setPageNumber("1");
        textInsteadOfNumber.setXPosition("153");
        textInsteadOfNumber.setYPosition("260");
        textInsteadOfNumber.setFont("helvetica");
        textInsteadOfNumber.setFontSize("size14");
        textInsteadOfNumber.setTabLabel("numbersOnly");
        textInsteadOfNumber.setHeight(23);
        textInsteadOfNumber.setWidth(84);
        textInsteadOfNumber.required("false");

        RadioGroup radioGroup = new RadioGroup();
        radioGroup.setDocumentId("1");
        radioGroup.setGroupName("radio1");

        radioGroup.setRadios(Arrays.asList(
                createRadio("white", "142"),
                createRadio("red", "74"),
                createRadio("blue", "220")
        ));

        Text text = new Text();
        text.setDocumentId("1");
        text.setPageNumber("1");
        text.setXPosition("153");
        text.setYPosition("230");
        text.setFont("helvetica");
        text.setFontSize("size14");
        text.setTabLabel("text");
        text.setHeight(23);
        text.setWidth(84);
        text.required("false");

        // Tabs are set per recipient / signer
        Tabs signer1Tabs = new Tabs();
        signer1Tabs.setCheckboxTabs(Arrays.asList(check1, check2, check3, check4));
        signer1Tabs.setListTabs(Arrays.asList(list1));
        // numberTabs: [number],
        signer1Tabs.setRadioGroupTabs(Arrays.asList(radioGroup));
        signer1Tabs.setSignHereTabs(Arrays.asList(signHere));
        signer1Tabs.textTabs(Arrays.asList(text, textInsteadOfNumber));

        signer1.setTabs(signer1Tabs);

        // Add the recipients to the env object
        Recipients recipients = new Recipients();
        recipients.setSigners(Arrays.asList(signer1));
        recipients.setCarbonCopies(Arrays.asList(cc1));

        // create the envelope template definition object
        EnvelopeTemplateDefinition envelopeTemplateDefinition = new EnvelopeTemplateDefinition();
        envelopeTemplateDefinition.setDescription("Example template created via the API");
        envelopeTemplateDefinition.setName(args.getTemplateName());
        envelopeTemplateDefinition.setShared("false");

        // create the overall template definition
        EnvelopeTemplate template = new EnvelopeTemplate();
        // The order in the docs array determines the order in the env
        template.setDocuments(Arrays.asList(doc));
        template.setEmailSubject("Please sign this document");
        template.setEnvelopeTemplateDefinition(envelopeTemplateDefinition);
        template.setRecipients(recipients);
        template.setStatus("created");


        return template;
    }

    private ListItem createListItem(String color) {
        ListItem item = new ListItem();
        item.setText(color);
        item.setValue(color.toLowerCase());
        return item;
    }

    private Radio createRadio(String value, String xPosition) {
        Radio radio = new Radio();
        radio.setPageNumber("1");
        radio.setValue(value);
        radio.setXPosition(xPosition);
        radio.setYPosition("384");
        radio.setRequired("false");
        return radio;
    }
}
