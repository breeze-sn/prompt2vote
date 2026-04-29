import React from 'react';
import './App.css';
import { ChatAssistant } from './components/ChatAssistant';
import { JourneyProvider } from './context/JourneyProvider';
import { useJourney } from './context/JourneyContext';
import type { Persona } from './constants/steps';

const PERSONAS: { id: Persona; label: string; icon: string; desc: string }[] = [
  { id: 'First-time voter',      label: 'First Time Voter',     icon: 'how_to_vote', desc: 'Just turned 18 and voting for the first time' },
  { id: 'Student',               label: 'Student',              icon: 'school',      desc: 'Want to understand the election process better' },
  { id: 'Working professional',  label: 'Working Professional', icon: 'work',        desc: 'Short on time, need quick civic guidance' },
];

const NAV_ITEMS: { label: string; icon: string }[] = [
  { label: 'Guidelines',   icon: 'rule'           },
  { label: 'Eligibility',  icon: 'verified_user'  },
  { label: 'Registration', icon: 'app_registration'},
  { label: 'Voter ID',     icon: 'badge'          },
  { label: 'Voter Day',    icon: 'event_available'},
];

const AppContent: React.FC = () => {
  const { userPersona, setPersona } = useJourney();
  const [showPersonaChoice, setShowPersonaChoice] = React.useState(false);
  const [showGuidelines, setShowGuidelines]       = React.useState(false);
  const [sidebarOpen, setSidebarOpen]             = React.useState(false);

  const handlePersonaSelect = (persona: Persona) => {
    setPersona(persona);
    setShowGuidelines(true);
  };

  const handleAgree = () => setShowGuidelines(false);
  const resetJourney = () => window.location.reload();

  /* ── Landing ── */
  if (!userPersona) {
    return (
      <div className="lp-root">
        <header className="lp-header">
          <span className="lp-logo">Prompt2Vote</span>
          <nav className="lp-nav">
            <a href="#about">About</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">Github</a>
          </nav>
        </header>

        {!showPersonaChoice ? (
          <div className="lp-hero">
            <div className="lp-hero-text">
              <h1>Navigate the Election Process<br />with Confidence</h1>
              <p>A simple, AI-powered assistant to help you understand and complete every step of the election process.</p>
              <button className="lp-cta" onClick={() => setShowPersonaChoice(true)}>Get Started</button>
            </div>
          </div>
        ) : (
          <div className="persona-screen">
            <h2 className="ps-title">Who are you?</h2>
            <p className="ps-sub">Choose your persona so we can personalise your experience.</p>
            <div className="ps-cards">
              {PERSONAS.map(p => (
                <button key={p.id} className="ps-card" onClick={() => handlePersonaSelect(p.id)}>
                  <span className="material-symbols-rounded ps-icon">{p.icon}</span>
                  <span className="ps-label">{p.label}</span>
                  <span className="ps-desc">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── Guidelines Modal ── */
  if (showGuidelines) {
    return (
      <div className="modal-overlay">
        <div className="modal-box">
          <h2 className="modal-title">Important Guidelines</h2>
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
            <li>Bribery, impersonation, or duplicate voting are punishable offenses</li>
          </ol>
          <div className="modal-footer">
            <button className="modal-agree" onClick={handleAgree}>Agree and Continue</button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Chat ── */
  return (
    <div className="chat-root">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sb-top">
          <button className="sb-btn" onClick={() => setSidebarOpen(v => !v)}>
            <span className="material-symbols-rounded">menu</span>
            {sidebarOpen && <span className="sb-btn-label">Menu</span>}
          </button>
          <button className="sb-btn" onClick={resetJourney}>
            <span className="material-symbols-rounded">edit_square</span>
            {sidebarOpen && <span className="sb-btn-label">New Chat</span>}
          </button>
        </div>

        {sidebarOpen && (
          <nav className="sb-nav">
            <div className="sb-section">
              {NAV_ITEMS.map(item => (
                <div key={item.label} className="sb-item">
                  <span className="material-symbols-rounded sb-item-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="sb-section sb-footer">
              <div className="sb-item">
                <span className="material-symbols-rounded sb-item-icon">info</span>
                <span>About</span>
              </div>
              <div className="sb-item">
                <span className="material-symbols-rounded sb-item-icon">code</span>
                <span>Github</span>
              </div>
            </div>
          </nav>
        )}
      </aside>

      {/* Main */}
      <main className="chat-main">
        <div className="chat-topbar">
          <span className="chat-logo">Prompt2Vote</span>
        </div>
        <div className="chat-area">
          <ChatAssistant />
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <JourneyProvider>
      <AppContent />
    </JourneyProvider>
  );
}
