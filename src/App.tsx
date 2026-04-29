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

  const handlePersonaSelect = (persona: Persona) => {
    setPersona(persona);
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

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Prompt2Vote</h1>
        <div className="persona-info">
          <span>Role: <strong>{userPersona}</strong></span>
        </div>
      </header>
        <main className="main-layout">
          <aside className="left-panel">
            <h2>Your Journey</h2>
            <Timeline />
          </aside>

          <section className="right-panel">
            <div className="card">
              <h2>Chat Assistant</h2>
              <ChatAssistant />
            </div>

            {currentStep === 1 && ( // Registration
              <div className="card">
                <h2>Registration Checklist</h2>
                <Registration />
              </div>
            )}

            {currentStep === 2 && ( // Voter ID
              <div className="card">
                <h2>Your Voter ID (e-EPIC)</h2>
                <VoterID />
              </div>
            )}

            {currentStep === 3 && ( // Voting Day
              <div className="card">
                <h2>Interactive Simulation</h2>
                <Simulation />
              </div>
            )}

            <div className="card">
              <h2>Important Guidelines</h2>
              <Guidelines />
            </div>

            <div className="navigation-controls">
              <button 
                onClick={prevStep} 
                disabled={isFirstStep}
                className="nav-btn secondary"
              >
                Back
              </button>
              <button 
                onClick={nextStep} 
                disabled={isLastStep}
                className="nav-btn primary"
              >
                {isLastStep ? 'Complete Journey' : 'Next Step'}
              </button>
            </div>
          </section>
        </main>
      )}
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
