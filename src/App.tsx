import React from 'react';
import './App.css';
import { Timeline } from './components/Timeline';
import { ChatAssistant } from './components/ChatAssistant';
import { Simulation } from './components/Simulation';
import { JourneyProvider } from './context/JourneyProvider';
import { useJourney } from './context/JourneyContext';
import type { Persona } from './constants/steps';

const AppContent: React.FC = () => {
  const { currentStep, userPersona, setPersona, nextStep, prevStep, isFirstStep, isLastStep } = useJourney();

  const handlePersonaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPersona(e.target.value as Persona);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Prompt2Vote</h1>
        <div className="persona-selector">
          <label htmlFor="persona">I am a:</label>
          <select id="persona" value={userPersona || ''} onChange={handlePersonaChange}>
            <option value="" disabled>Select your persona</option>
            <option value="First-time voter">First-time voter</option>
            <option value="Student">Student</option>
            <option value="Working professional">Working professional</option>
          </select>
        </div>
      </header>

      {!userPersona ? (
        <div className="onboarding-overlay">
          <div className="card text-center">
            <h2>Welcome to Prompt2Vote</h2>
            <p>Please select your persona to begin your guided journey.</p>
          </div>
        </div>
      ) : (
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

            {currentStep === 3 && ( // Voting Day
              <div className="card">
                <h2>Interactive Simulation</h2>
                <Simulation />
              </div>
            )}

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
