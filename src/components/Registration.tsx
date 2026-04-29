import React, { useState } from 'react';

export const Registration: React.FC = () => {
  const [checklist, setChecklist] = useState({
    form6: false,
    address: false,
    age: false,
    photo: false
  });

  const toggleItem = (item: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const isComplete = Object.values(checklist).every(v => v);

  return (
    <div className="registration-content">
      <p>Follow this checklist to complete your registration on the <strong>NVSP Portal</strong>:</p>
      
      <div className="checklist-items">
        <label className="checklist-item">
          <input 
            type="checkbox" 
            checked={checklist.form6} 
            onChange={() => toggleItem('form6')} 
          />
          <span>Download Form 6 (For new registration)</span>
        </label>
        <label className="checklist-item">
          <input 
            type="checkbox" 
            checked={checklist.address} 
            onChange={() => toggleItem('address')} 
          />
          <span>Proof of Residence (e.g., Aadhaar, Utility Bill)</span>
        </label>
        <label className="checklist-item">
          <input 
            type="checkbox" 
            checked={checklist.age} 
            onChange={() => toggleItem('age')} 
          />
          <span>Proof of Age (18+)</span>
        </label>
        <label className="checklist-item">
          <input 
            type="checkbox" 
            checked={checklist.photo} 
            onChange={() => toggleItem('photo')} 
          />
          <span>Passport Size Photograph</span>
        </label>
      </div>

      {isComplete && (
        <div className="success-banner">
          🎉 You are ready! Visit <a href="https://www.nvsp.in/" target="_blank" rel="noopener noreferrer">NVSP.in</a> to submit.
        </div>
      )}
    </div>
  );
};
