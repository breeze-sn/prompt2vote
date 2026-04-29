import React, { useState } from 'react';

export const Simulation: React.FC = () => {
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAction = (action: string) => {
    switch (action) {
      case 'id':
        setFeedback("Great! The polling officer checks your ID and hands you a ballot. You are ready to vote.");
        break;
      case 'ask':
        setFeedback("The officer politely directs you to the identification verification line to check your registration details.");
        break;
      case 'leave':
        setFeedback("You leave the polling booth without voting. Remember, every vote counts!");
        break;
      default:
        setFeedback(null);
    }
  };

  return (
    <div className="simulation-content">
      <p><strong>Scenario:</strong> You arrive at a polling booth. What do you do?</p>
      
      <div className="simulation-options">
        <button className="sim-btn" onClick={() => handleAction('id')}>Show ID</button>
        <button className="sim-btn" onClick={() => handleAction('ask')}>Ask officer</button>
        <button className="sim-btn" onClick={() => handleAction('leave')}>Leave</button>
      </div>

      {feedback && (
        <div className="feedback-text">
          {feedback}
        </div>
      )}
    </div>
  );
};
