const credentials = {
  api_token: 'Q8QMBRFHdCZcmJwHzFwz',
  store_id: 'monca03956',
  test: true
};

// const credentials = {
//   api_token: 'yesguy',
//   store_id: 'store5',
//   test: true
// };

const moneris = require('moneris-node')(credentials);

const pay = async () => {
  try {
    const result = await moneris.pay({
      amount: 5.99 * 2,
      card: '4242424242424242',
      expiry: '20/21',
      description: 'Two drinks'
    });
    return result;
  } catch (e) {
    throw new Error(e);
  }
};

const send = async () => {
  // to do
};

const preauth = async transactionData => {
  const orderId =
    'Test' + new Date().getTime() + '-' + Math.ceil(Math.random() * 10000);
  const cust_id = 'ready' + '-' + 'player-' + Math.ceil(Math.random() * 10000);
  const amt = 5081 / 100;
  console.log(transactionData);
  try {
    const result = await moneris.send({
      type: 'res_preauth_cc',
      data: {
        order_id: orderId,
        amount: amt.toFixed(2),
        data_key: transactionData.dataKey,
        crypt_type: 7, //recurring
        cust_id: transactionData.cust_id || cust_id
      }
    });
    return result;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

// adds the card token
const addCard = async transactionData => {
  const orderId =
    'Test' + new Date().getTime() + '-' + Math.ceil(Math.random() * 10000);
  try {
    const result = await moneris.send({
      type: 'res_add_token',
      data: {
        order_id: orderId,
        data_key: transactionData.dataKey,
        crypt_type: 7,
        cust_id: transactionData.cust_id
      }
    });
    return result;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

// 'res_card_verification_cc' => array(
//   'data_key',
//   'order_id',
//   'crypt_type',
//   'expdate'),

// verifies the card, avs check
const verifyCard = async transactionData => {
  const orderId =
    'Test' + new Date().getTime() + '-' + Math.ceil(Math.random() * 10000);
  try {
    const result = await moneris.send({
      type: 'res_card_verification_cc',
      data: {
        order_id: orderId,
        data_key: transactionData.dataKey,
        crypt_type: 7
      }
    });
    return result;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const capture = async transactionData => {
  try {
    const result = await moneris.send({
      type: 'completion',
      data: {
        order_id: transactionData.order_id,
        amount: parseFloat(transactionData.amount).toFixed(2),
        txn_number: transactionData.txn_number,
        crypt_type: 1
      }
    });
    return result;
  } catch (e) {
    console.log(`Capture error :${e}`);
  }
};

const refund = async transactionData => {
  try {
    const result = await moneris.send({
      type: 'refund',
      data: {
        order_id: transactionData.order_id,
        amount: parseFloat(transactionData.amount).toFixed(2),
        txn_number: transactionData.txn_number,
        crypt_type: 1
      }
    });
    return result;
  } catch (e) {
    console.log(`Refund error :${e}`);
  }
};

const googlePay = async transactionData => {
  const { paymentMethodData, orderId, amount } = transactionData;
  const token = paymentMethodData.tokenizationData.token;
  const parsedToken = JSON.parse(token);
  const { signature, protocolVersion, signedMessage } = parsedToken;

  const info = paymentMethodData.info;
  const network = info.cardNetwork;

  try {
    const result = await moneris.send({
      type: 'googlepay_preauth',
      data: {
        order_id: orderId,
        amount: amount,
        payment_token: {
          signature: signature,
          protocol_version: protocolVersion,
          signed_message: signedMessage
        },
        network: network
      }
    });
    return result;
  } catch (e) {
    console.log(`Google Pay Error :${e}`);
  }
};

const applePay = async transactionData => {
  console.log(transactionData);
  const { orderId, paymentData, paymentMethod } = transactionData;
  const { version, signature, header, data } = paymentData;
  const { ephemeralPublicKey, publicKeyHash, transactionId } = header;
  try {
    const appePayPreauth = await moneris.send({
      type: 'applepay_token_preauth',
      data: {
        order_id: orderId,
        signature: signature,
        version: version,
        data: data,
        header: {
          public_key_hash: publicKeyHash,
          ephemeral_public_key: ephemeralPublicKey,
          transaction_id: transactionId
        }
      }
    });

    return appePayPreauth;
  } catch (e) {
    console.log(`Apple Pay Error :${e}`);
    throw e;
  }
};

module.exports = {
  monerisPay: pay,
  monerisSend: send,
  monerisPreauth: preauth,
  monerisCapture: capture,
  monerisRefund: refund,
  monerisAddCard: addCard,
  monerisVerifyCard: verifyCard,
  monerisGooglePay: googlePay,
  monerisApplePay: applePay
};
