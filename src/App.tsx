import React, { useState } from 'react';
import './App.css';
import { Timeline } from './components/Timeline';
import { ChatAssistant } from './components/ChatAssistant';
import { Simulation } from './components/Simulation';

export type Persona = 'First-time voter' | 'Student' | 'Working professional';

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [persona, setPersona] = useState<Persona>('First-time voter');

  const handlePersonaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPersona(e.target.value as Persona);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Prompt2Vote</h1>
        <div className="persona-selector">
          <label htmlFor="persona">I am a:</label>
          <select id="persona" value={persona} onChange={handlePersonaChange}>
            <option value="First-time voter">First-time voter</option>
            <option value="Student">Student</option>
            <option value="Working professional">Working professional</option>
          </select>
        </div>
      </header>

      <main className="main-layout">
        <aside className="left-panel">
          <h2>Your Journey</h2>
          <Timeline currentStep={currentStep} onStepChange={setCurrentStep} />
        </aside>

        <section className="right-panel">
          <div className="card">
            <h2>Chat Assistant</h2>
            <ChatAssistant persona={persona} currentStep={currentStep} />
          </div>

          <div className="card">
            <h2>Interactive Simulation</h2>
            <Simulation />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
