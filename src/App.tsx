import React from 'react';
import './App.css';
import { Timeline } from './components/Timeline';
import { ChatAssistant } from './components/ChatAssistant';
import { Simulation } from './components/Simulation';
import { Registration } from './components/Registration';
import { VoterID } from './components/VoterID';
import { Guidelines } from './components/Guidelines';
import { JourneyProvider } from './context/JourneyProvider';
import { useJourney } from './context/JourneyContext';
import type { Persona } from './constants/steps';

const AppContent: React.FC = () => {
  const { currentStep, userPersona, setPersona, nextStep, prevStep, isFirstStep, isLastStep } = useJourney();
  const [showPersonaChoice, setShowPersonaChoice] = React.useState(false);
  const [showGuidelines, setShowGuidelines] = React.useState(false);
  const [agreedToGuidelines, setAgreedToGuidelines] = React.useState(false);

  const handlePersonaSelect = (persona: Persona) => {
    setPersona(persona);
    setShowGuidelines(true);
  };

  const handleAgree = () => {
    setShowGuidelines(false);
    setAgreedToGuidelines(true);
  };

  if (!userPersona) {
    return (
      <div className="landing-page">
        <header className="landing-header">
          <div className="logo">Prompt2Vote</div>
          <nav className="landing-nav">
            <a href="#about">About</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">Github</a>
          </nav>
        </header>

        {!showPersonaChoice ? (
          <div className="hero-section">
            <div className="hero-content">
              <h1>Navigate the Election Process with Confidence</h1>
              <p>A simple, AI-powered assistant to help you understand and complete every step of the election process.</p>
              <button 
                className="get-started-btn" 
                onClick={() => setShowPersonaChoice(true)}
              >
                Get Started
              </button>
            </div>
          </div>
        ) : (
          <div className="persona-selection-screen">
            <div className="persona-content">
              <p className="selection-label">Please select your persona:</p>
              <div className="persona-options">
                <button onClick={() => handlePersonaSelect('First-time voter')}>First Time Voter</button>
                <button onClick={() => handlePersonaSelect('Student')}>Student</button>
                <button onClick={() => handlePersonaSelect('Working professional')}>Working Professional</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (showGuidelines) {
    return (
      <div className="modal-overlay">
        <div className="guidelines-modal">
          <h2>Important Guidelines</h2>
          <ol className="modal-list">
            <li>Must be 18+ and registered in the electoral roll</li>
            <li>Only one voter registration is allowed</li>
            <li>Use Form 6 (new/update) and Form 8 (corrections)</li>
            <li>Carry a valid government ID (Voter ID preferred)</li>
            <li>Verify your name and polling booth location in advance</li>
            <li>Voting is confidential (secret ballot)</li>
            <li>No mobile phones or electronics inside the polling booth</li>
            <li>You may choose the NOTA option</li>
            <li>Assistance is available for elderly and differently-abled voters</li>
            <li>Bribery, impersonation, or duplicate voting are punishable offense</li>
          </ol>
          <div className="modal-footer">
            <button className="agree-btn" onClick={handleAgree}>Agree and Continue</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gemini-layout">
      <aside className="gemini-sidebar">
        <div className="sidebar-top">
          <div className="sidebar-icon">☰</div>
          <div className="sidebar-icon">📝</div>
        </div>
      </aside>

      <main className="gemini-main">
        <header className="gemini-header">
          <div className="logo">Prompt2Vote</div>
          <nav className="gemini-nav">
            <a href="#about">About</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">Github</a>
          </nav>
        </header>

        <div className="gemini-chat-area">
          <ChatAssistant />
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <JourneyProvider>
      <AppContent />
    </JourneyProvider>
  );
}

export default App;
