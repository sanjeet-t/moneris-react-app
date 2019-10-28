import React from 'react';
import Button from 'react-bootstrap/Button';
import './transactionData.css';

const TransactionData = ({
  tokenData,
  preauthData,
  captureData,
  goBack,
  doPreauth,
  doCapture,
  doRefund,
  refunded
}) => {
  const tokenKeys = tokenData ? Object.keys(tokenData) : null;
  const preauthKeys = preauthData ? Object.keys(preauthData) : null;
  const captureKeys = captureData ? Object.keys(captureData) : null;
  const showPreauthBtn = tokenKeys && !preauthKeys;
  const showCaptureBtn = preauthKeys && !captureKeys;
  return (
    <React.Fragment>
      {tokenKeys && (
        <div className="transaction-data">
          <div className="transaction-success">Tokenization Success</div>
          {tokenKeys.map((key, id) => (
            <div key={id}>
              {key} : {tokenData[key]}
            </div>
          ))}
        </div>
      )}
      {preauthKeys && (
        <div className="transaction-data">
          <div className="transaction-success">Preauth Success</div>
          <div>ReceiptId : {preauthData['ReceiptId']}</div>
          <div>ReferenceNum : {preauthData['ReferenceNum']}</div>
          <div>TransID : {preauthData['TransID']}</div>
          <div>Complete : {preauthData['Complete']}</div>
          <div>AuthCode : {preauthData['AuthCode']}</div>
          <div>ResponseCode : {preauthData['ResponseCode']}</div>
          <div>AvsResultCode : {preauthData['AvsResultCode']}</div>
          <div>CvdResultCode : {preauthData['CvdResultCode']}</div>
          <div>TransAmount : {preauthData['TransAmount']}</div>
        </div>
      )}
      {captureKeys && (
        <div className="transaction-data">
          <div className="transaction-success">Capture Success</div>
          <div>ReceiptId : {captureData['ReceiptId']}</div>
          <div>ReferenceNum : {captureData['ReferenceNum']}</div>
          <div>TransID : {captureData['TransID']}</div>
          <div>Complete : {captureData['Complete']}</div>
          <div>AuthCode : {captureData['AuthCode']}</div>
          <div>ResponseCode : {captureData['ResponseCode']}</div>
          <div>TransType : {captureData['TransType']}</div>
          <div>TransAmount : {captureData['TransAmount']}</div>
        </div>
      )}
      {refunded && (
        <div className="transaction-data">
          <div className="transaction-success">Refund Success</div>
        </div>
      )}
      <div className="button-container">
        {' '}
        <Button variant="primary" onClick={goBack}>
          Go Back
        </Button>
        {showPreauthBtn && (
          <Button variant="primary" onClick={doPreauth}>
            Do a preauth
          </Button>
        )}
        {showCaptureBtn && (
          <Button variant="primary" onClick={doCapture}>
            Do a Capture
          </Button>
        )}
        {captureKeys && !refunded && (
          <Button variant="primary" onClick={doRefund}>
            Do a Refund
          </Button>
        )}
      </div>
    </React.Fragment>
  );
};

export default TransactionData;
