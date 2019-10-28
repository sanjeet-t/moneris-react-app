import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import TransactionData from './components/transactionData';
import GooglePayService from './services/googlePay';
import './App.css';
import { configuration } from './config';

const axios = require('axios');

class App extends Component {
  state = {
    tokenData: null,
    preauthData: null,
    captureData: null,
    refundData: null,
    showForm: true,
    refunded: false,
    googleLoaded: false,
    api_server_up: false
  };

  respMsg = e => {
    let respData = JSON.parse(JSON.stringify(e.data));

    // filter out react specific messages
    const reactSpecficFilter =
      respData.source && respData.source.includes('react');

    // filter out google specific messages from moneris
    const googlePayFilter =
      respData.sentinel || respData.type === 'receiptReady';

    const filtered = reactSpecficFilter || googlePayFilter;
    if (filtered) {
      return;
    }

    // moneris iframe messsaes
    respData = JSON.parse(respData);

    const { showForm } = this.state;
    if (!respData.errorMessage) {
      console.log(`---tokenization success---`);
      this.setState({ tokenData: respData });
      this.setState({ showForm: !showForm });
      return;
    }
    console.log(`---tokenization failure---`);
  };

  componentDidMount = async () => {
    if (window.addEventListener) {
      window.addEventListener('message', this.respMsg, false);
    } else {
      if (window.attachEvent) {
        window.attachEvent('onmessage', this.respMsg);
      }
    }

    // check if API is up
    if (!this.state.api_server_up) {
      console.log(`Checking for API service`);
      await this.pingAPI();
    }

    // slow networks delay loading of google
    const setupGooglePay = setInterval(this.setUpGooglePay.bind(this), 5);
    if (this.state.googleLoaded) {
      clearInterval(setupGooglePay);
    }
  };

  pingAPI = async () => {
    try {
      const apiState = await axios.get(configuration.API_URL);
      if (apiState.status === 200) {
        this.setState({ api_server_up: true });
      }
    } catch (e) {}
  };

  setUpGooglePay() {
    if (window.google && !this.state.googleLoaded) {
      this.setState({ googleLoaded: true });
      const googlePay = new GooglePayService();
      googlePay.addGooglePayButton(this.doGooglePay);
      if (window.MonerisGooglePay) {
        window.MonerisGooglePay.onReady();
      }
    }
  }

  doGooglePay = async response => {
    const url = configuration.MONERIS_API_URL + '/google-pay';
    console.log(`---response from google---`);
    console.log(response);
    try {
      const result = await axios.post(url, {
        data: response
      });
      if (result && result.data.Complete[0].toString() === 'true') {
        console.log(`---google preauth success---`);
        this.setState({ preauthData: result.data });
        await this.doCapture();
      } else {
        console.log(`---google preauth failure---`);
      }
      // console.log(result.data);
    } catch (e) {
      console.log(`Cannot do preauth : ${e}`);
    }
  };

  doMonerisSubmit = e => {
    e.preventDefault();
    const monFrameRef = this.refs.MonerisFrame.contentWindow;
    monFrameRef.postMessage('tokenize', configuration.MONERIS_HPP_TOKEN_URL);

    return false;
  };

  backToMainPage = e => {
    e.preventDefault();
    const { showForm } = this.state;
    this.setState({ showForm: !showForm });
    this.setState({ tokenData: null });
    this.setState({ preauthData: null });
    this.setState({ captureData: null });
    this.setState({ refunded: false });
  };

  handleMonerisResponse = result => {
    const responseCode = parseInt(result.data.ResponseCode[0].toString());
    if (responseCode < 50) {
      console.log(`---transaction successful---`);
      return result.data;
    }
    console.error(`---transaction failed---`);
    return result.data.ResponseCode[0];
  };

  doPreauth = async () => {
    const url = configuration.MONERIS_API_URL + '/preauth';
    try {
      const result = await axios.post(url, {
        data: this.state.tokenData
      });
      const transData = this.handleMonerisResponse(result);
      this.setState({ preauthData: transData });
    } catch (e) {
      console.log(`Cannot do preauth : ${e}`);
      throw e;
    }
  };

  doCapture = async () => {
    const url = configuration.MONERIS_API_URL + '/capture';
    const { preauthData } = this.state;
    try {
      const result = await axios.post(url, {
        data: {
          order_id: preauthData.ReceiptId.toString(),
          amount: preauthData.TransAmount.toString(),
          txn_number: preauthData.TransID.toString()
        }
      });
      const transData = this.handleMonerisResponse(result);
      this.setState({ captureData: transData });
    } catch (e) {
      console.log(`Cannot do capture : ${e}`);
      throw e;
    }
  };

  doRefund = async () => {
    const url = configuration.MONERIS_API_URL + '/refund';
    const { captureData } = this.state;
    try {
      const result = await axios.post(url, {
        data: {
          order_id: captureData.ReceiptId.toString(),
          amount: captureData.TransAmount.toString(),
          txn_number: captureData.TransID.toString()
        }
      });
      const transData = this.handleMonerisResponse(result);
      this.setState({ refundData: transData });
      this.setState({ refunded: true });
    } catch (e) {
      console.log(`Cannot do refund : ${e}`);
      throw e;
    }
  };

  render() {
    const {
      tokenData,
      showForm,
      preauthData,
      captureData,
      refunded
    } = this.state;

    return (
      <div className="App">
        <div className="outer-page">
          Moneris : This is the outer page
          <title>Outer Frame - Merchant Page</title>
        </div>

        {!showForm && (
          <div id="monerisResponse">
            <TransactionData
              tokenData={tokenData}
              preauthData={preauthData}
              captureData={captureData}
              goBack={this.backToMainPage}
              doPreauth={this.doPreauth}
              doCapture={this.doCapture}
              doRefund={this.doRefund}
              refunded={refunded}
            />
          </div>
        )}
        {showForm && (
          <div className="iframe-container">
            Moneris Iframe
            <iframe
              className="monerisFrame"
              title={'Moneris Iframe'}
              id="monerisFrame"
              src={configuration.MONERIS_IFRAME_URL}
              frameBorder="0"
              ref="MonerisFrame"
            />
            <Button
              variant="primary"
              onClick={this.doMonerisSubmit}
              className="pay-btn"
            >
              Pay
            </Button>
          </div>
        )}
        <div className="google-pay">
          Google Pay
          <div id="google-pay-btn-container"></div>
          <div
            id="moneris-google-pay"
            store-id={configuration.STORE_ID}
            web-merchant-key={configuration.WEB_MERCHANT_KEY}
          ></div>
        </div>
      </div>
    );
  }
}

export default App;
