import React from 'react';

export const Guidelines: React.FC = () => {
  return (
    <div className="guidelines-content">
      <ul className="guidelines-list">
        <li>
          <strong>Eligibility:</strong> Ensure you are 18 years of age or above as of January 1st of the qualifying year.
        </li>
        <li>
          <strong>Single Registration:</strong> It is a punishable offense to be registered in more than one constituency.
        </li>
        <li>
          <strong>Form 6:</strong> Use this for new registration or if you have shifted from another constituency.
        </li>
        <li>
          <strong>Form 8:</strong> Use this for any corrections in your existing voter details (name, age, address).
        </li>
        <li>
          <strong>Voting Day ID:</strong> While Voter ID is preferred, you can carry other valid govt IDs (Aadhaar, DL, Passport) if your name is in the electoral roll.
        </li>
        <li>
          <strong>No Electronics:</strong> Mobile phones, cameras, and smartwatches are strictly prohibited inside the polling booth.
        </li>
      </ul>
      <div className="pro-tip">
        💡 <strong>Pro Tip:</strong> Always check your name in the electoral roll at <a href="https://electoralsearch.eci.gov.in/" target="_blank" rel="noopener noreferrer">electoralsearch.eci.gov.in</a> before heading to the booth.
      </div>
    </div>
  );
};
