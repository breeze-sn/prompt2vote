import React, { useState } from 'react';
import { generateChatResponse } from '../services/gemini';
import { useJourney } from '../context/JourneyContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const PRESETS: Array<{ q: string; a: string }> = [
  {
    q: 'I just turned 18, what should I do?',
    a: '• Congratulations — you are eligible to register.\n• Use Form 6 to apply as a new voter.\n• Register online at voters.eci.gov.in (NVSP) or submit the form at your local registration office.\n• Keep a valid ID and proof of age ready.'
  },
  {
    q: 'How do I register to vote?',
    a: '• Use Form 6 for new voter registration.\n• Apply online at voters.eci.gov.in or NVSP.\n• Upload photo, age proof, and address proof.\n• Track status with the reference ID.'
  },
  {
    q: 'What should I carry on voting day?',
    a: '• Carry your EPIC (Voter ID) or another valid government photo ID (Aadhaar, Passport, DL, PAN).\n• Bring any appointment or reference proof if asked.\n• Keep mobile phones outside the polling booth as per rules.'
  },
];

const clean = (text: string) =>
  text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');

/**
 * ChatAssistant
 *
 * Main chat UI component that handles the conversation, rendering messages,
 * managing the input area and preset chips. It delegates response generation
 * to `generateChatResponse` and uses the `useJourney` context for persona and
 * step-aware behavior.
 */
export const ChatAssistant: React.FC = () => {
  const { currentStep, userPersona, setPersona } = useJourney();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  const send = async (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    try {
      const res = await generateChatResponse(text, userPersona, currentStep);
      setMessages(prev => [...prev, { role: 'assistant', content: clean(res) }]);
    } catch (e: any) {
      console.error(e);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${e?.message ?? 'Could not reach AI. Check your API key or internet connection.'}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  /**
   * linkify
   *
   * Convert plain text containing URLs into React nodes with clickable anchors.
   * Handles http(s) URLs and bare domains (e.g., example.com/path).
   */
  const linkify = (text: string): React.ReactNode[] => {
    if (!text) return [text];
    // Regex matches http(s) URLs or bare domains like example.com/path
    const urlRegex = /((https?:\/\/)[^\s]+)|((?:www\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[^\s]*))/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = urlRegex.exec(text)) !== null) {
      const idx = match.index;
      if (idx > lastIndex) {
        parts.push(text.slice(lastIndex, idx));
      }
      const url = match[0];
      // Ensure protocol
      const href = url.startsWith('http') ? url : `https://${url}`;
      parts.push(
        <a key={`${idx}-${href}`} href={href} target="_blank" rel="noopener noreferrer" className="in-message-link">{url}</a>
      );
      lastIndex = idx + url.length;
    }
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    return parts.length ? parts : [text];
  };

  React.useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading]);

  // Close persona menu on outside click
  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node | null;
      // if menu not rendered yet, don't close
      if (!menuRef.current) return;
      if (target && !menuRef.current.contains(target)) {
        setShowPersonaMenu(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div className="gemini-chat-container">

      {/* ── Empty state greeting ── */}
      {messages.length === 0 && (
        <div className="greeting-container">
          <h1>Hello there!</h1>
          <h2>How can I help you?</h2>
        </div>
      )}

      {/* ── Messages ── */}
      {messages.length > 0 && (
        <div className="gemini-messages">
          {messages.map((msg, i) =>
            msg.role === 'user' ? (
              <div key={i} className="gemini-message user">{linkify(msg.content)}</div>
            ) : (
              <div key={i} className="gemini-message assistant">
                <div className="bot-label">Clara</div>
                <div className="bot-content-wrapper">
                  <div className="bot-avatar" />
                  <div className="bot-text">{linkify(msg.content)}</div>
                </div>
              </div>
            )
          )}

          {/* Loading shimmer */}
          {loading && (
            <div className="gemini-message assistant">
              <div className="bot-label">Clara</div>
              <div className="bot-content-wrapper">
                <div className="bot-avatar pulse" />
                <div className="shimmer-container">
                  <div className="shimmer-line" />
                  <div className="shimmer-line short" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Input area ── */}
      <div className="input-section">
        <div 
          className="gemini-input-box"
          onClick={() => inputRef.current?.focus()}
        >
          <div className="input-header">
            <span className="material-symbols-rounded">verified_user</span>
            <span>Ask a Question…</span>
          </div>

          <textarea
            ref={inputRef}
            value={input}
            rows={3}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Type your message here..."
            autoFocus
          />

          <div className="input-bottom">
            <div className="persona-toggle" onClick={() => setShowPersonaMenu(v => !v)} aria-haspopup="menu" aria-expanded={showPersonaMenu} role="button">
              <span>{userPersona ?? 'Select persona'}</span>
              <span className="material-symbols-rounded">expand_more</span>
            </div>
            {showPersonaMenu && (
              <div className="persona-menu" ref={menuRef} role="menu" aria-label="Choose persona">
                <div className="persona-menu-head">
                  <div className="pi-head-title">Choose persona</div>
                  <button className="persona-menu-close" onClick={() => setShowPersonaMenu(false)} aria-label="Close persona menu">✕</button>
                </div>
                <button className={`persona-item ${userPersona === 'First-time voter' ? 'active' : ''}`} onClick={() => { setPersona('First-time voter'); }} role="menuitem">
                  <span className="material-symbols-rounded">how_to_vote</span>
                  <div>
                    <div className="pi-title">First Time Voter</div>
                    <div className="pi-desc">Just turned 18 and voting for the first time</div>
                  </div>
                </button>
                <button className={`persona-item ${userPersona === 'Student' ? 'active' : ''}`} onClick={() => { setPersona('Student'); }} role="menuitem">
                  <span className="material-symbols-rounded">school</span>
                  <div>
                    <div className="pi-title">Student</div>
                    <div className="pi-desc">Want to understand the election process better</div>
                  </div>
                </button>
                <button className={`persona-item ${userPersona === 'Working professional' ? 'active' : ''}`} onClick={() => { setPersona('Working professional'); }} role="menuitem">
                  <span className="material-symbols-rounded">work</span>
                  <div>
                    <div className="pi-title">Working Professional</div>
                    <div className="pi-desc">Short on time, need quick civic guidance</div>
                  </div>
                </button>
              </div>
            )}
            <div className="mic-icon">
              <span className="material-symbols-rounded">mic</span>
            </div>
          </div>
        </div>

        {/* Preset chips (insert preset Q&A locally without calling the AI) */}
        <div className="preset-chips">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              className="chip"
              onClick={() => {
                // insert user question and local preset answer immediately
                setMessages(prev => [...prev, { role: 'user', content: p.q }, { role: 'assistant', content: p.a }]);
                // ensure input cleared and no AI call
                setInput('');
              }}
            >
              {p.q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
