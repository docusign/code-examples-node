#  document 1 (html) has tag **signature_1**
#  document 2 (docx) has tag /sn1/
#  document 3 (pdf) has tag /sn1/
# 
#  The envelope has two recipients.
#  recipient 1 - signer
#  recipient 2 - cc
#  The envelope will be sent first to the signer.
#  After it is signed, a copy is sent to the cc person.

# temp files:
request_data=$(mktemp /tmp/request-eg-002.XXXXXX)
response=$(mktemp /tmp/response-eg-002.XXXXXX)
doc1_base64=$(mktemp /tmp/eg-002-doc1.XXXXXX)
doc2_base64=$(mktemp /tmp/eg-002-doc2.XXXXXX)
doc3_base64=$(mktemp /tmp/eg-002-doc3.XXXXXX)

# Fetch docs and encode
cat ../demo_documents/doc_1.html | base64 > $doc1_base64
cat ../demo_documents/World_Wide_Corp_Battle_Plan_Trafalgar.docx | base64 > $doc2_base64
cat ../demo_documents/World_Wide_Corp_lorem.pdf | base64 > $doc3_base64

echo ""
echo "Sending the envelope request to DocuSign..."
echo "The envelope has three documents. Processing time will be about 15 seconds."
echo "Results:"
echo ""

# Concatenate the different parts of the request
printf \
'{
    "emailSubject": "Please sign this document set",
    "documents": [
        {
            "documentBase64": "' > $request_data
            cat $doc1_base64 >> $request_data
            printf '",
            "name": "Order acknowledgement",
            "fileExtension": "html",
            "documentId": "1"
        },
        {
            "documentBase64": "' >> $request_data
            cat $doc2_base64 >> $request_data
            printf '",
            "name": "Battle Plan",
            "fileExtension": "docx",
            "documentId": "2"
        },
        {
            "documentBase64": "' >> $request_data
            cat $doc3_base64 >> $request_data
            printf '",
            "name": "Lorem Ipsum",
            "fileExtension": "pdf",
            "documentId": "3"
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
                "tabs": {
                    "signHereTabs": [
                        {
                            "anchorString": "**signature_1**",
                            "anchorUnits": "pixels",
                            "anchorXOffset": "20",
                            "anchorYOffset": "10"
                        },
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
     --output $response

echo ""
cat $response

# pull out the envelopeId
envelope_id=`cat $response | grep envelopeId | sed 's/.*\"envelopeId\": \"//' | sed 's/\",.*//'`
