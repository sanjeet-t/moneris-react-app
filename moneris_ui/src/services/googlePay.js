export default class GooglePayService {
  constructor() {
    this.paymentsClient = null;

    this.baseRequest = {
      apiVersion: 2,
      apiVersionMinor: 0
    };

    this.allowedCardNetworks = [
      'AMEX',
      'DISCOVER',
      'INTERAC',
      'JCB',
      'MASTERCARD',
      'VISA'
    ];

    this.allowedCardAuthMethods = ['PAN_ONLY', 'CRYPTOGRAM_3DS'];

    this.tokenizationSpecification = {
      type: 'PAYMENT_GATEWAY',
      parameters: {
        gateway: 'moneris',
        gatewayMerchantId: 'monca03956'
      }
    };

    this.baseCardPaymentMethod = {
      type: 'CARD',
      parameters: {
        allowedAuthMethods: this.allowedCardAuthMethods,
        allowedCardNetworks: this.allowedCardNetworks
      }
    };

    this.cardPaymentMethod = Object.assign({}, this.baseCardPaymentMethod, {
      tokenizationSpecification: this.tokenizationSpecification
    });
  }

  getGoogleIsReadyToPayRequest() {
    return Object.assign({}, this.baseRequest, {
      allowedPaymentMethods: [this.baseCardPaymentMethod]
    });
  }

  getGooglePaymentDataRequest() {
    const paymentDataRequest = Object.assign({}, this.baseRequest);
    paymentDataRequest.allowedPaymentMethods = [this.cardPaymentMethod];
    paymentDataRequest.transactionInfo = this.getGoogleTransactionInfo();
    paymentDataRequest.merchantInfo = {
      // @todo a merchant ID is available for a production environment after approval by Google
      // See {@link https://developers.google.com/pay/api/web/guides/test-and-deploy/integration-checklist|Integration checklist}
      merchantId: '01234567890123456789',
      merchantName: 'Example Merchant'
    };
    return paymentDataRequest;
  }

  getGooglePaymentsClient() {
    if (this.paymentsClient === null && window.google.payments) {
      this.paymentsClient = new window.google.payments.api.PaymentsClient({
        environment: 'TEST'
      });
    }
    return this.paymentsClient;
  }

  onGooglePayLoaded() {
    const paymentsClient = this.getGooglePaymentsClient();
    paymentsClient
      .isReadyToPay(this.getGoogleIsReadyToPayRequest())
      .then(response => {
        if (response.result) {
          this.addGooglePayButton();
          // @todo prefetch payment data to improve performance after confirming site functionality
          // prefetchGooglePaymentData();
        }
      })
      .catch(function(err) {
        // show error in developer console for debugging
        console.error(err);
      });
  }

  addGooglePayButton(callback) {
    const paymentsClient = this.getGooglePaymentsClient();
    const button = paymentsClient.createButton({
      onClick: this.onGooglePaymentButtonClicked.bind(this, callback)
    });
    document.getElementById('google-pay-btn-container').appendChild(button);
  }

  getGoogleTransactionInfo() {
    return {
      countryCode: 'CA',
      currencyCode: 'CAD',
      totalPriceStatus: 'FINAL',
      // set to cart total
      totalPrice: '1.00'
    };
  }

  prefetchGooglePaymentData() {
    const paymentDataRequest = this.getGooglePaymentDataRequest();
    // transactionInfo must be set but does not affect cache
    paymentDataRequest.transactionInfo = {
      totalPriceStatus: 'FINAL',
      currencyCode: 'CA'
    };
    const paymentsClient = this.getGooglePaymentsClient();
    paymentsClient.prefetchPaymentData(paymentDataRequest);
  }

  async onGooglePaymentButtonClicked(callback) {
    const paymentDataRequest = this.getGooglePaymentDataRequest();
    paymentDataRequest.transactionInfo = this.getGoogleTransactionInfo();

    const paymentsClient = this.getGooglePaymentsClient();

    try {
      const paymentData = await paymentsClient.loadPaymentData(
        paymentDataRequest
      );
      await this.processPayment(paymentData, callback);
    } catch (e) {
      console.error(e);
    }
  }

  processPayment(paymentData, callback) {
    // show returned data in developer console for debugging
    // @todo pass payment token to your gateway to process payment
    // const paymentToken = paymentData.paymentMethodData.tokenizationData.token;
    paymentData['orderId'] = 'GooglePayTest' + new Date().getTime();
    paymentData['amount'] = this.getGoogleTransactionInfo().totalPrice;
    callback(paymentData);

    // window.MonerisGooglePay.preauth(paymentData, response => {
    //   console.log(response);
    //   if (
    //     response &&
    //     response.receipt &&
    //     response.receipt.ResponseCode &&
    //     !isNaN(response.receipt.ResponseCode)
    //   ) {
    //     if (parseInt(response.receipt.ResponseCode) < 50) {
    //       callback(response);
    //     } else {
    //       console.log(`Transacation not approved by Moneris`);
    //     }
    //   } else {
    //     throw new Error('Error processing receipt.');
    //   }
    // });
  }
}
