import React from 'react';

export const VoterID: React.FC = () => {
  return (
    <div className="voter-id-content">
      <p>Once your registration is processed, you can download your <strong>e-EPIC (Electronic Voter ID)</strong>:</p>
      
      <div className="voter-id-steps">
        <div className="info-box">
          <h4>How to download?</h4>
          <ol>
            <li>Go to the <a href="https://voters.eci.gov.in/" target="_blank" rel="noopener noreferrer">ECI Portal</a>.</li>
            <li>Login with your credentials.</li>
            <li>Enter your <strong>EPIC Number</strong> or Form Reference Number.</li>
            <li>Verify with OTP sent to your registered mobile.</li>
            <li>Click <strong>Download e-EPIC</strong>.</li>
          </ol>
        </div>

        <div className="alert-box">
          <strong>Note:</strong> e-EPIC is a non-editable PDF version of the Voter ID Card that can be printed and is valid for all identification purposes.
        </div>
      </div>
    </div>
  );
};
