# Step 1. Create the envelope.
#         The signer recipient includes a clientUserId setting
#
#  document 1 (pdf) has tag /sn1/ 
#  The envelope has two recipients.
#  recipient 1 - signer
#  recipient 2 - cc
#  The envelope will be sent first to the signer.
#  After it is signed, a copy is sent to the cc person.

base_path="https://demo.docusign.net/restapi"
# temp files:
request_data=$(mktemp /tmp/request-eg-001.XXXXXX)
response=$(mktemp /tmp/response-eg-001.XXXXXX)
doc1_base64=$(mktemp /tmp/eg-001-doc1.XXXXXX)

echo ""
echo "Sending the envelope request to DocuSign..."

# Fetch doc and encode
cat ../demo_documents/World_Wide_Corp_lorem.pdf | base64 > $doc1_base64
# Concatenate the different parts of the request
printf \
'{
    "emailSubject": "Please sign this document set",
    "documents": [
        {
            "documentBase64": "' > $request_data
            cat $doc1_base64 >> $request_data
            printf '",
            "name": "Lorem Ipsum",
            "fileExtension": "pdf",
            "documentId": "1"
        }
    ],
    "recipients": {
        "carbonCopies": [
            {
                "email": "{USER_EMAIL}",
                "name": "Charles Copy",
                "recipientId": "2",
                "routingOrder": "2"
            }
        ],
        "signers": [
            {
                "email": "{USER_EMAIL}",
                "name": "{USER_FULLNAME}",
                "recipientId": "1",
                "routingOrder": "1",
                "clientUserId": "1000",
                "tabs": {
                    "signHereTabs": [
                        {
                            "anchorString": "/sn1/",
                            "anchorUnits": "pixels",
                            "anchorXOffset": "20",
                            "anchorYOffset": "10"
                        }
                    ]
                }
            }
        ]
    },
    "status": "sent"
}' >> $request_data

curl --header "Authorization: Bearer ${access_token}" \
     --header "Content-Type: application/json" \
     --data-binary @${request_data} \
     --request POST ${base_path}/v2/accounts/${account_id}/envelopes \
     --output ${response}

echo ""
echo "Response:"
cat $response
echo ""

# pull out the envelopeId
envelope_id=`cat $response | grep envelopeId | sed 's/.*\"envelopeId\": \"//' | sed 's/\",.*//'`
echo "EnvelopeId: ${envelope_id}"

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
