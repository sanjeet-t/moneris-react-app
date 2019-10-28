const express = require('express');
const router = express.Router();
const monerisController = require('./moneris.controller');

router.get('/', (req, res) => {
  res.send(`Moneris API is up...`);
});

router.get('/pay', async (req, res) => {
  try {
    console.log(`Doing a moneris pay...`);
    const payRes = await monerisController.monerisPay();
    res.send(payRes);
  } catch (e) {
    res.status(400).send(`Cannot pay via moneris`);
  }
});

// handle moneris add card (store token permanently)
router.post('/card', async (req, res) => {
  const { data } = req.body;
  try {
    const preauthRes = await monerisController.monerisAddCard(data);
    res.send(preauthRes);
  } catch (e) {
    console.log(e);
    res.status(400).send(`Cannot do preauth`);
  }
});

// avs check
router.post('/verify-card', async (req, res) => {
  const { data } = req.body;
  try {
    const preauthRes = await monerisController.monerisVerifyCard(data);
    res.send(preauthRes);
  } catch (e) {
    console.log(e);
    res.status(400).send(`Cannot do preauth`);
  }
});

// handle moneris preauth
router.post('/preauth', async (req, res) => {
  const { data } = req.body;
  try {
    const preauthRes = await monerisController.monerisPreauth(data);
    res.send(preauthRes);
  } catch (e) {
    console.log(e);
    res.status(400).send(`Cannot do preauth`);
  }
});

router.post('/capture', async (req, res) => {
  // handle moneris capture
  const { data } = req.body;
  try {
    const captureRes = await monerisController.monerisCapture(data);
    res.send(captureRes);
  } catch (e) {
    console.log(e);
    res.status(400).send(`Cannot do preauth`);
  }
});

router.post('/refund', async (req, res) => {
  // handle moneris refund
  const { data } = req.body;
  try {
    const refundRes = await monerisController.monerisRefund(data);
    res.send(refundRes);
  } catch (e) {
    console.log(e);
    res.status(400).send(`Cannot do refund : ${e}`);
  }
});

router.post('/google-pay', async (req, res) => {
  // handle moneris refund
  const { data: googlePayData } = req.body;
  try {
    const googlePayRes = await monerisController.monerisGooglePay(
      googlePayData
    );
    res.send(googlePayRes);
  } catch (e) {
    console.log(e);
    res.status(401).send(`Cannot do google pay : ${e}`);
  }
});

router.post('/apple-pay', async (req, res) => {
  // handle moneris apple-pay
  const applePayData = req.body;
  try {
    const applePayRes = await monerisController.monerisApplePay(applePayData);
    res.send(applePayRes);
  } catch (e) {
    console.log(e);
    res.status(400).send(`Cannot do apple pay : ${e}`);
  }
});

module.exports = router;
