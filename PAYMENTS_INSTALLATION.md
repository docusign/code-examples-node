# Configure a payment gateway

DocuSign offers built-in connections to multiple payment gateways. The payments code example uses a developer account via the Stripe gateway service.


## Create a Stripe payment gateway

1. Select the Stripe button on the [**Payments**](https://admindemo.docusign.com/authenticate?goTo=payments) page in your developer account.

1. For development, you can skip the Stripe account application by using the **Skip this account form** link at the top of the page.<br />

   ![Skipping the Stripe account form](docs/stripe_skip_account_form_link.png) 

   An enabled Stripe payment gateway is now associated with your DocuSign developer account and is shown under **Payment Gateway**.

1. Save the **Gateway Account ID** GUID to the code example launcher configuration file.


## Additional documentation
* [Managing Payment Gateways](https://support.docusign.com/en/guides/managing-payment-gateways)
* [How to send a request for payment](https://developers.docusign.com/docs/esign-rest-api/how-to/request-a-payment)  
