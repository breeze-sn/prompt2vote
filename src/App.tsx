import React from 'react';
import './App.css';
import { ChatAssistant } from './components/ChatAssistant';
import { AboutPage } from './components/AboutPage';
import { Registration } from './components/Registration';
import { useJourney } from './context/JourneyContext';
import { JourneyProvider } from './context/JourneyProvider';
import { useAuth } from './context/AuthContext';
import type { Persona } from './constants/steps';
import type { ChatSession, ChatMessage } from './constants/chat';
import { createChatSession, summarizeChat, loadChatSessionsFromFirestore, saveChatSessionToFirestore } from './constants/chat';
import { classifyQuestion, recordChatEvent, trackGoogleEvent } from './services/googleServices';
import { generateChatResponse } from './services/gemini';
import { sanitizeUserInput } from './utils/security';
import heroImg from './assets/hero.png';
import { getFirestore } from 'firebase/firestore';

const PERSONAS: { id: Persona; label: string; icon: string; desc: string }[] = [
  { id: 'First-time voter', label: 'First Time Voter', icon: 'how_to_vote', desc: 'Just turned 18 and voting for the first time' },
  { id: 'Student', label: 'Student', icon: 'school', desc: 'Want to understand the election process better' },
  { id: 'Working professional', label: 'Working Professional', icon: 'work', desc: 'Short on time, need quick civic guidance' },
];

type MenuKey = 'guidelines' | 'eligibility' | 'registration' | 'voterId' | 'voterDay' | 'election';

const NAV_ITEMS: { id: MenuKey; label: string; icon: string }[] = [
  { id: 'election', label: 'Election', icon: 'campaign' },
  { id: 'eligibility', label: 'Eligibility', icon: 'verified_user' },
  { id: 'registration', label: 'Registration', icon: 'app_registration' },
  { id: 'guidelines', label: 'Guidelines', icon: 'rule' },
  { id: 'voterId', label: 'Voter ID', icon: 'badge' },
  { id: 'voterDay', label: 'Voter Day', icon: 'event_available' },
];

const MENU_DETAILS: Record<MenuKey, { title: string; subtitle: string; badge: string; body: React.ReactNode; confirmLabel: string }> = {
  guidelines: {
    title: 'Important Guidelines',
    subtitle: 'Start here for the core election rules and voting etiquette.',
    badge: 'Guidelines',
    body: (
      <div className="modal-content-inner">
        <ol className="modal-list">
          <li>Must be 18+ and listed in the electoral roll</li>
          <li>Only one voter registration is allowed</li>
          <li>Use Form 6 (new/update) and Form 8 (corrections)</li>
          <li>Carry a valid government ID (Voter ID preferred)</li>
          <li>Verify your name and polling booth location in advance</li>
          <li>Voting is confidential (secret ballot)</li>
          <li>No mobile phones or electronics inside the polling booth</li>
          <li>You may choose the NOTA option</li>
          <li>Assistance is available for elderly and differently-abled voters</li>
          <li>Bribery, impersonation, or duplicate voting are punishable offences</li>
        </ol>
      </div>
    ),
    confirmLabel: 'Agree and Continue',
  },
  eligibility: {
    title: 'Eligibility Check',
    subtitle: 'Confirm the basic requirements before you begin registration or voting.',
    badge: 'Eligibility',
    body: (
      <div className="detail-grid">
        <article className="detail-card">
          <h3>Age requirement</h3>
          <p>You must be 18 years or older on the qualifying date announced for the election roll.</p>
        </article>
        <article className="detail-card">
          <h3>Citizenship</h3>
          <p>Only Indian citizens can register as voters in the electoral roll.</p>
        </article>
        <article className="detail-card">
          <h3>Residency</h3>
          <p>You should normally be residing in the constituency where you want to register.</p>
        </article>
        <article className="detail-card">
          <h3>Roll status</h3>
          <p>Your name should appear only once in the electoral roll. Duplicate registration is not allowed.</p>
        </article>
      </div>
    ),
    confirmLabel: 'Close',
  },
  registration: {
    title: 'Registration Checklist',
    subtitle: 'Use this checklist to get your voter registration ready on the NVSP portal.',
    badge: 'Registration',
    body: <Registration />,
    confirmLabel: 'Close',
  },
  voterId: {
    title: 'Voter ID Details',
    subtitle: 'Know what to carry and how to download your e-EPIC when needed.',
    badge: 'Voter ID',
    body: (
      <div className="detail-stack">
        <section className="detail-section">
          <h3>Accepted identity proof</h3>
          <p>Carry your EPIC card if you have it. In many cases, other valid government IDs can also help with verification if your name is on the roll.</p>
        </section>
        <section className="detail-section">
          <h3>e-EPIC download</h3>
          <p>After registration is processed, you can download your electronic voter card from the official voter services portal.</p>
        </section>
        <section className="detail-section">
          <h3>Before polling day</h3>
          <p>Double-check that the name, photo, and address printed on your voter ID match your current details.</p>
        </section>
      </div>
    ),
    confirmLabel: 'Close',
  },
  voterDay: {
    title: 'Voter Day Checklist',
    subtitle: 'A quick walkthrough of what to do when you go to vote.',
    badge: 'Voting Day',
    body: (
      <div className="detail-stack">
        <section className="detail-section">
          <h3>What to carry</h3>
          <p>Bring your voter ID and any other required government identification so the polling staff can verify your entry.</p>
        </section>
        <section className="detail-section">
          <h3>At the booth</h3>
          <p>Follow the queue, listen to the polling officers, and keep your phone and other electronic devices outside the booth area.</p>
        </section>
        <section className="detail-section">
          <h3>After voting</h3>
          <p>Confirm your vote, leave the booth calmly, and keep the process confidential for everyone else in the queue.</p>
        </section>
      </div>
    ),
    confirmLabel: 'Close',
  },
  election: {
    title: 'Elections in India',
    subtitle: 'Overview of how elections work in India and what voters should know.',
    badge: 'Election',
    body: (
      <div className="detail-stack">
        <section className="detail-section">
          <h3>What are elections?</h3>
          <p>India holds democratic elections at multiple levels — national (Lok Sabha), state (Vidhan Sabha), and local bodies. Elections decide representation and government formation.</p>
        </section>

        <section className="detail-section">
          <h3>Who runs elections?</h3>
          <p>The Election Commission of India (ECI) is the independent authority that administers and supervises all election processes, ensuring free and fair polls.</p>
        </section>

        <section className="detail-section">
          <h3>Voting system</h3>
          <p>India uses the first-past-the-post system: the candidate with the highest votes in a constituency wins the seat.</p>
        </section>

        <section className="detail-section">
          <h3>Key rules</h3>
          <ul className="guidelines-list">
            <li>Model Code of Conduct applies during elections</li>
            <li>Voter registration must be current and accurate</li>
            <li>Polling booths enforce ID checks and no-electronics rules</li>
          </ul>
        </section>

        <section className="detail-section">
          <h3>Where to learn more</h3>
          <p>Official resources: <a href="https://eci.gov.in/" target="_blank" rel="noopener noreferrer">eci.gov.in</a> and the national voter portal at <a href="https://voters.eci.gov.in/" target="_blank" rel="noopener noreferrer">voters.eci.gov.in</a>.</p>
        </section>
      </div>
    ),
    confirmLabel: 'Close',
  },
};

const AppContent: React.FC = () => {
  const { userPersona, setPersona } = useJourney();
  const { user, isGuest, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  const [showPersonaChoice, setShowPersonaChoice] = React.useState(false);
  const [showAccountMenu, setShowAccountMenu] = React.useState(false);
  const [activeMenu, setActiveMenu] = React.useState<MenuKey | null>(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [showAbout, setShowAbout] = React.useState(false);
  const [chatSessions, setChatSessions] = React.useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const activeSession = chatSessions.find(session => session.id === activeSessionId) ?? chatSessions[0] ?? null;

  // Load chat sessions from Firestore or localStorage based on user type
  React.useEffect(() => {
    if (user) {
      if (isGuest) {
        // Load from localStorage for guest users
        try {
          const stored = localStorage.getItem(`prompt2vote.guest.${user.uid}`);
          if (stored) {
            const sessions = JSON.parse(stored) as ChatSession[];
            setChatSessions(sessions);
            if (sessions.length > 0 && !activeSessionId) {
              setActiveSessionId(sessions[0].id);
            }
          }
        } catch (err) {
          console.error('Failed to load guest sessions:', err);
        }
      } else {
        // Load from Firestore for authenticated users
        const firestore = getFirestore();
        void loadChatSessionsFromFirestore(firestore, user.uid).then(sessions => {
          setChatSessions(sessions);
          if (sessions.length > 0 && !activeSessionId) {
            setActiveSessionId(sessions[0].id);
          }
        });
      }
    }
  }, [user?.uid, isGuest]);

  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveMenu(null);
        setShowAccountMenu(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.account-menu-container')) {
        setShowAccountMenu(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    document.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Save sessions to Firestore or localStorage based on user type
  React.useEffect(() => {
    if (user && activeSession) {
      if (isGuest) {
        // Save to localStorage for guest users
        try {
          const key = `prompt2vote.guest.${user.uid}`;
          const existing = localStorage.getItem(key);
          const sessions = existing ? JSON.parse(existing) as ChatSession[] : [];
          const index = sessions.findIndex(s => s.id === activeSession.id);
          if (index >= 0) {
            sessions[index] = activeSession;
          } else {
            sessions.unshift(activeSession);
          }
          // Keep max 20 sessions for guests
          if (sessions.length > 20) {
            sessions.pop();
          }
          localStorage.setItem(key, JSON.stringify(sessions));
        } catch (err) {
          console.error('Failed to save guest sessions:', err);
        }
      } else {
        // Save to Firestore for authenticated users
        const firestore = getFirestore();
        void saveChatSessionToFirestore(firestore, user.uid, activeSession);
      }
    }
  }, [user?.uid, activeSession, isGuest]);

  React.useEffect(() => {
    if (userPersona && !activeSessionId) {
      const nextSession = createChatSession(userPersona);
      setChatSessions(prev => [nextSession, ...prev]);
      setActiveSessionId(nextSession.id);
      return;
    }

    if (!activeSessionId && chatSessions.length > 0) {
      setActiveSessionId(chatSessions[0].id);
    }
  }, [activeSessionId, chatSessions, userPersona]);

  const handlePersonaSelect = (persona: Persona) => {
    setPersona(persona);
    const nextSession = createChatSession(persona);
    setChatSessions(prev => [nextSession, ...prev]);
    setActiveSessionId(nextSession.id);
    setShowPersonaChoice(false);
    setActiveMenu('guidelines');
  };

  const closeMenu = () => setActiveMenu(null);
  const handleMenuOpen = (menu: MenuKey) => setActiveMenu(menu);

  const handleNewChat = () => {
    const nextSession = createChatSession(userPersona);
    setChatSessions(prev => [nextSession, ...prev]);
    setActiveSessionId(nextSession.id);
    setSidebarOpen(true);
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setSidebarOpen(true);
  };

  const handleSendMessage = async (text: string) => {
    const safeText = sanitizeUserInput(text);
    if (!safeText) return;

    const category = classifyQuestion(safeText);
    const userMessage: ChatMessage = { role: 'user', content: safeText };
    const assistantFallback = 'I could not generate a response.';
    let sessionId = activeSessionId;

    if (!sessionId) {
      const newSession = createChatSession(userPersona);
      sessionId = newSession.id;
      setChatSessions(prev => [newSession, ...prev]);
      setActiveSessionId(sessionId);
    }

    setLoading(true);
    void trackGoogleEvent('chat_question_sent', { category, persona: userPersona ?? 'unselected', step: 0 });

    setChatSessions(prev => prev.map(session => {
      if (session.id !== sessionId) return session;
      const updatedMessages = [...session.messages, userMessage];
      const summary = summarizeChat(updatedMessages);
      return {
        ...session,
        persona: userPersona ?? session.persona,
        messages: updatedMessages,
        title: summary.title,
        preview: summary.preview,
        icon: summary.icon,
        updatedAt: Date.now(),
      };
    }));

    try {
      const res = await generateChatResponse(safeText, userPersona, 0);
      const assistantMessage: ChatMessage = { role: 'assistant', content: res.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1') };

      setChatSessions(prev => prev.map(session => {
        if (session.id !== sessionId) return session;
        const updatedMessages = [...session.messages, userMessage, assistantMessage];
        const summary = summarizeChat(updatedMessages);
        return {
          ...session,
          persona: userPersona ?? session.persona,
          messages: updatedMessages,
          title: summary.title,
          preview: summary.preview,
          icon: summary.icon,
          updatedAt: Date.now(),
        };
      }));

      void recordChatEvent({
        source: 'manual',
        category,
        persona: userPersona,
        step: 0,
        promptLength: safeText.length,
        hadModelResponse: true,
      });
    } catch (error) {
      console.error(error);
      setChatSessions(prev => prev.map(session => {
        if (session.id !== sessionId) return session;
        const fallbackMessage: ChatMessage = { role: 'assistant', content: assistantFallback };
        const updatedMessages = [...session.messages, userMessage, fallbackMessage];
        const summary = summarizeChat(updatedMessages);
        return {
          ...session,
          persona: userPersona ?? session.persona,
          messages: updatedMessages,
          title: summary.title,
          preview: summary.preview,
          icon: summary.icon,
          updatedAt: Date.now(),
        };
      }));

      void recordChatEvent({
        source: 'system',
        category,
        persona: userPersona,
        step: 0,
        promptLength: safeText.length,
        hadModelResponse: false,
      });
    } finally {
      setLoading(false);
    }
  };

  /* Auto-collapse sidebar on small screens and keep state in sync with resize */
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 900) {
        setSidebarOpen(false);
      }
    };

    // apply initially
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* ── About Page ── */
  if (showAbout) {
    return <AboutPage onBack={() => setShowAbout(false)} />;
  }

  /* ── Loading Auth State ── */
  if (authLoading) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000000',
      }}>
        <div style={{
          textAlign: 'center',
          color: '#ffffff',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            borderTopColor: '#1F87FC',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
            margin: '0 auto 16px',
          }}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  /* ── Persona Selection / Landing (Authenticated, No Persona) ── */
  if (!userPersona) {
    return (
      <div className="lp-root">
        <header className="lp-header">
          <span className="lp-logo">Prompt2Vote</span>
          <nav className="lp-nav">
            <a href="#" onClick={(e) => { e.preventDefault(); setShowAbout(true); }}>About</a>
            <a href="https://github.com/breeze-sn/prompt2vote" target="_blank" rel="noopener noreferrer">Github</a>
          </nav>
        </header>

        {!showPersonaChoice ? (
          <div className="lp-hero">
            <div className="lp-hero-text">
              <h1>Navigate the Election Process<br />with Confidence</h1>
              <p>Meet Clara, your AI-powered election guide for every step of the process.</p>
              <button className="lp-cta" onClick={() => {
                if (!user) {
                  void signInWithGoogle();
                } else {
                  setShowPersonaChoice(true);
                }
              }}>
                Get Started
              </button>
            </div>

            <div className="lp-hero-visual" aria-hidden="true">
              <img src={heroImg} alt="Voting eligibility and election process guide illustration" className="hero-img" />
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

  /* ── Menu Details Modal ── */
  if (activeMenu) {
    const details = MENU_DETAILS[activeMenu];

    return (
      <div className="modal-overlay" onClick={closeMenu}>
        <div className={`modal-box menu-modal modal-${activeMenu}`} onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="menu-modal-title">
          <div className="modal-head">
            <div className="modal-header-content">
              <p className="modal-kicker">{details.badge}</p>
              <h2 className="modal-title" id="menu-modal-title">{details.title}</h2>
              <p className="modal-subtitle">{details.subtitle}</p>
            </div>
            <button className="modal-close" onClick={closeMenu} aria-label="Close popup">
              <span className="material-symbols-rounded">close</span>
            </button>
          </div>

          <div className="modal-body">
            {details.body}
          </div>

          <div className="modal-footer">
            <button className="modal-agree" onClick={closeMenu}>{details.confirmLabel}</button>
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
          <button className="sb-btn" onClick={() => setSidebarOpen(v => !v)} aria-label={sidebarOpen ? 'Collapse sidebar' : 'Open sidebar'}>
            <span className="material-symbols-rounded">menu</span>
            {sidebarOpen && <span className="sb-btn-label">Menu</span>}
          </button>
          <button className="sb-btn" onClick={handleNewChat} aria-label="Start a new chat">
            <span className="material-symbols-rounded">add_comment</span>
            {sidebarOpen && <span className="sb-btn-label">New Chat</span>}
          </button>
        </div>

        {sidebarOpen && (
          <nav className="sb-nav">
            <div className="sb-section">
              {NAV_ITEMS.map(item => (
                <button key={item.label} type="button" className="sb-item" onClick={() => handleMenuOpen(item.id)} aria-haspopup="dialog">
                  <span className="material-symbols-rounded sb-item-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="sb-history">
              <div className="sb-history-title">Recent chats</div>
              <div className="sb-history-list" role="list" aria-label="Recent chats">
                {chatSessions.length === 0 ? (
                  <div className="sb-history-empty">No chat history yet</div>
                ) : (
                  chatSessions.map(session => (
                    <button
                      key={session.id}
                      type="button"
                      className={`sb-item sb-thread ${session.id === activeSessionId ? 'active' : ''}`}
                      onClick={() => handleSelectSession(session.id)}
                      aria-pressed={session.id === activeSessionId}
                    >
                      <span className="material-symbols-rounded sb-item-icon">{session.icon}</span>
                      <span className="sb-thread-copy">
                        <span className="sb-thread-title">{session.title}</span>
                        <span className="sb-thread-preview">{session.preview}</span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="sb-section sb-footer">
              <button type="button" className="sb-item" onClick={() => setShowAbout(true)}>
                <span className="material-symbols-rounded sb-item-icon">info</span>
                <span>About</span>
              </button>
              <div className="sb-item">
                <a href="https://github.com/breeze-sn/prompt2vote" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <span className="material-symbols-rounded sb-item-icon">code</span>
                  <span>Github</span>
                </a>
              </div>
            </div>
          </nav>
        )}
      </aside>

      {/* Main */}
      <main className="chat-main">
        <div className="chat-topbar">
          <span className="chat-logo">Prompt2Vote</span>
          <div className="chat-topbar-actions">
            <div className="account-menu-container">
              <button
                className="topbar-button user-profile"
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                title={`Signed in as ${user?.displayName || user?.email || 'User'}`}
                aria-label="Account menu"
                aria-expanded={showAccountMenu}
              >
                <img
                  src={user?.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.displayName || 'User')}
                  alt="User avatar"
                  className="avatar"
                />
              </button>

              {showAccountMenu && (
                <div className="account-menu">
                  <div className="account-menu-header">
                    <img
                      src={user?.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.displayName || 'User')}
                      alt="User avatar"
                      className="account-avatar"
                    />
                    <div className="account-info">
                      <p className="account-name">{user?.displayName || 'Guest User'}</p>
                      <p className="account-email">{user?.email || 'No email'}</p>
                    </div>
                  </div>

                  <div className="account-menu-divider"></div>

                  <button className="account-menu-item manage-account" onClick={() => {
                    setShowAccountMenu(false);
                    void signInWithGoogle();
                  }}>
                    <span className="material-symbols-rounded">manage_accounts</span>
                    <span>Switch account</span>
                  </button>

                  <div className="account-menu-divider"></div>

                  <button className="account-menu-item logout" onClick={() => {
                    setShowAccountMenu(false);
                    void signOut();
                  }}>
                    <span className="material-symbols-rounded">logout</span>
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="chat-area">
          <ChatAssistant messages={activeSession?.messages ?? []} loading={loading} onSendMessage={handleSendMessage} />
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
