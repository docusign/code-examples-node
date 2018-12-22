# Get the envelope recipients' details
# This script uses the envelope_id stored in ../envelope_id.
# The envelope_id file is created by example eg002SigningViaEmail.sh or
# can be manually created.

# Configuration
# 1. Obtain an OAuth access token from 
#    https://developers.docusign.com/oauth-token-generator
access_token='{ACCESS_TOKEN}'
# 2. Obtain your accountId from demo.docusign.com -- the account id is shown in
#    the drop down on the upper right corner of the screen by your picture or 
#    the default picture. 
account_id='{ACCOUNT_ID}'

# Check that we're in a bash shell
if [[ $SHELL != *"bash"* ]]; then
  echo "PROBLEM: Run these scripts from within the bash shell."
fi
base_path="https://demo.docusign.net/restapi"

# Check that we have an envelope id
if [ ! -f ../ENVELOPE_ID ]; then
    echo ""
    echo "PROBLEM: An envelope id is needed. Fix: execute script eg002SigningViaEmail.sh"
    echo ""
    exit -1
fi
envelope_id=`cat ../ENVELOPE_ID`

echo ""
echo "Sending the EnvelopeRecipients::list request to DocuSign..."
echo "Results:"
echo ""

curl --header "Authorization: Bearer ${access_token}" \
     --header "Content-Type: application/json" \
     --request GET ${base_path}/v2/accounts/${account_id}/envelopes/${envelope_id}/recipients

echo ""
echo ""
echo "Done."
echo ""

