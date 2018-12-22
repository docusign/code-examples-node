# Embedded Signing Ceremony from template with added document

# Configuration
# 1. Search for and update '{USER_EMAIL}' and '{USER_FULLNAME}'.
#    They occur and re-occur multiple times below.
# 2. Obtain an OAuth access token from 
#    https://developers.docusign.com/oauth-token-generator
access_token='{ACCESS_TOKEN}'
# 3. Obtain your accountId from demo.docusign.com -- the account id is shown in
#    the drop down on the upper right corner of the screen by your picture or 
#    the default picture. 
account_id='{ACCOUNT_ID}'

# Check that we're in a bash shell
if [[ $SHELL != *"bash"* ]]; then
  echo "PROBLEM: Run these scripts from within the bash shell."
fi
base_path="https://demo.docusign.net/restapi"
# Check that we have a template id
if [ ! -f ../TEMPLATE_ID ]; then
    echo ""
    echo "PROBLEM: An template id is needed. Fix: execute script eg008CreateTemplate.sh"
    echo ""
    exit -1
fi
template_id=`cat ../TEMPLATE_ID`

# temp files:
request_data=$(mktemp /tmp/request-eg-013.XXXXXX)
response=$(mktemp /tmp/response-eg-013.XXXXXX)
doc1_base64=$(mktemp /tmp/eg-013-doc1.XXXXXX)

# Fetch docs and encode
cat ../demo_documents/added_document.html | base64 > $doc1_base64

echo ""
echo "Sending the envelope request to DocuSign..."
echo "A template is used, it has one document. A second document will be"
echo "added by using Composite Templates"

# Concatenate the different parts of the request
#  document 1 (html) has tag **signature_1**
printf \
'{
    "compositeTemplates": [
        {
            "compositeTemplateId": "1",
            "inlineTemplates": [
                {
                    "recipients": {
                        "carbonCopies": [
                            {
                                "email": "{USER_EMAIL}",
                                "name": "Charlie Copy",
                                "recipientId": "2",
                                "roleName": "cc"
                            }
                        ],
                        "signers": [
                            {
                                "clientUserId": "1000",
                                "email": "{USER_EMAIL}",
                                "name": "{USER_FULLNAME}",
                                "recipientId": "1",
                                "roleName": "signer"
                            }
                        ]
                    },
                    "sequence": "1"
                }
            ],
            "serverTemplates": [
                {
                    "sequence": "1",
                    "templateId": "' > $request_data
                    printf "${template_id}" >> $request_data
                    printf '"
                }
            ]
        },
        {
            "compositeTemplateId": "2",
            "document": {
                "documentBase64": "' >> $request_data
                cat $doc1_base64 >> $request_data
                printf '",
                "documentId": "1",
                "fileExtension": "html",
                "name": "Appendix 1--Sales order"
            },
            "inlineTemplates": [
                {
                    "recipients": {
                        "carbonCopies": [
                            {
                                "email": "{USER_EMAIL}",
                                "name": "Charlie Copy",
                                "recipientId": "2",
                                "roleName": "cc"
                            }
                        ],
                        "signers": [
                            {
                                "email": "{USER_EMAIL}",
                                "name": "{USER_FULLNAME}",
                                "recipientId": "1",
                                "roleName": "signer",
                                "tabs": {
                                    "signHereTabs": [
                                        {
                                            "anchorString": "**signature_1**",
                                            "anchorUnits": "pixels",
                                            "anchorXOffset": "20",
                                            "anchorYOffset": "10"
                                        }
                                    ]
                                }
                            }
                        ]
                    },
                    "sequence": "2"
                }
            ]
        }
    ],
    "status": "sent"
}' >> $request_data

curl --header "Authorization: Bearer ${access_token}" \
     --header "Content-Type: application/json" \
     --data-binary @${request_data} \
     --request POST ${base_path}/v2/accounts/${account_id}/envelopes \
     --output $response

echo ""
echo "Results:"
echo ""
cat $response

# pull out the envelopeId
envelope_id=`cat $response | grep envelopeId | sed 's/.*\"envelopeId\": \"//' | sed 's/\",.*//'`

# Step 2. Create a recipient view (a signing ceremony view)
#         that the signer will directly open in their browser to sign.
#
# The returnUrl is normally your own web app. DocuSign will redirect
# the signer to returnUrl when the signing ceremony completes.
# For this example, we'll use http://httpbin.org/get to show the 
# query parameters passed back from DocuSign

echo ""
echo "Requesting the url for the signing ceremony..."
curl --header "Authorization: Bearer ${access_token}" \
     --header "Content-Type: application/json" \
     --data-binary '
{
    "returnUrl": "http://httpbin.org/get",
    "authenticationMethod": "none",
    "email": "{USER_EMAIL}",
    "userName": "{USER_FULLNAME}",
    "clientUserId": 1000,
}' \
     --request POST ${base_path}/v2/accounts/${account_id}/envelopes/${envelope_id}/views/recipient \
     --output ${response}

echo ""
echo "Response:"
cat $response
echo ""

signing_ceremony_url=`cat $response | grep url | sed 's/.*\"url\": \"//' | sed 's/\".*//'`
echo ""
printf "The signing ceremony URL is ${signing_ceremony_url}\n"
printf "It is only valid for a couple of minutes. Attempting to automatically open your browser...\n"
if which xdg-open &> /dev/null  ; then
  xdg-open "$signing_ceremony_url"
elif which open &> /dev/null    ; then
  open "$signing_ceremony_url"
elif which start &> /dev/null   ; then
  start "$signing_ceremony_url"
fi

# cleanup
rm "$request_data"
rm "$response"
rm "$doc1_base64"

echo ""
echo ""
echo "Done."
echo ""

