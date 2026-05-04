import React, { useState } from 'react';
import { useJourney } from '../context/JourneyContext';
import { useAuth } from '../context/AuthContext';
import { QUICK_START_ITEMS } from '../constants/quickStart';
import type { ChatMessage } from '../constants/chat';
import { isSafeLinkUrl } from '../utils/security';
import { getGoogleServicesLabel } from '../services/googleServices';

const SAFE_URL_PATTERN = /((https?:\/\/)[^\s]+)|((?:www\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[^\s]*))/g;

const safeLinkify = (text: string): React.ReactNode[] => {
  if (!text) return [text];

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const urlRegex = new RegExp(SAFE_URL_PATTERN.source, 'g');

  while ((match = urlRegex.exec(text)) !== null) {
    const idx = match.index;
    if (idx > lastIndex) {
      parts.push(text.slice(lastIndex, idx));
    }

    const rawUrl = match[0];
    const href = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
    if (isSafeLinkUrl(href)) {
      parts.push(
        <a key={`${idx}-${href}`} href={href} target="_blank" rel="noopener noreferrer" className="in-message-link">
          {rawUrl}
        </a>
      );
    } else {
      parts.push(rawUrl);
    }

    lastIndex = idx + rawUrl.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length ? parts : [text];
};

/**
 * ChatAssistant
 *
 * Controlled chat UI component that displays messages and allows user input.
 * Message state and API communication are managed by the parent (App.tsx).
 * This component handles UI rendering, input management, persona selection, and preset chip display.
 */
interface ChatAssistantProps {
  messages: ChatMessage[];
  loading: boolean;
  onSendMessage: (text: string) => Promise<void>;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ messages, loading, onSendMessage }) => {
  const { userPersona, setPersona } = useJourney();
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const servicesLabel = getGoogleServicesLabel();
  const userName = user?.displayName || user?.email || 'You';
  const avatarSeed = user?.displayName || user?.email || 'User';
  const userAvatar = user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(avatarSeed)}`;
  const claraName = 'Clara';
  const claraAvatar = 'https://ui-avatars.com/api/?name=Clara&background=6f2dbd&color=ffffff';

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    setInput('');
    setShowPersonaMenu(false);
    await onSendMessage(text);
  };

  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

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
    <div className="gemini-chat-container" aria-busy={loading}>

      {/* ── Empty state greeting ── */}
      {messages.length === 0 && (
        <div className="greeting-container" aria-live="polite">
          <h1>Hi, I'm Clara.</h1>
          <h2>How can I help you vote with confidence?</h2>
        </div>
      )}

      {/* ── Messages ── */}
      {messages.length > 0 && (
        <div className="gemini-messages" role="log" aria-live="polite" aria-relevant="additions text">
          {messages.map((msg, i) =>
            msg.role === 'user' ? (
              <div key={i} className="gemini-message user">
                <div className="user-label">{userName}</div>
                <div className="user-content-wrapper">
                  <div className="user-text">{safeLinkify(msg.content)}</div>
                  <img className="user-avatar" src={userAvatar} alt={`${userName} avatar`} />
                </div>
              </div>
            ) : (
              <div key={i} className="gemini-message assistant">
                <div className="bot-label">{claraName}</div>
                <div className="bot-content-wrapper">
                  <div className="bot-profile">
                    <div className="bot-sphere" aria-hidden="true" />
                    <img className="bot-avatar" src={claraAvatar} alt={`${claraName} profile`} />
                  </div>
                  <div className="bot-text">{safeLinkify(msg.content)}</div>
                </div>
              </div>
            )
          )}

          {/* Loading shimmer */}
          {loading && (
            <div className="gemini-message assistant">
              <div className="bot-label">{claraName}</div>
              <div className="bot-content-wrapper">
                <div className="bot-profile">
                  <div className="bot-sphere pulse" aria-hidden="true" />
                  <img className="bot-avatar" src={claraAvatar} alt={`${claraName} profile`} />
                </div>
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
            <span>Ask Clara a question...</span>
            <span className="service-chip" aria-label={`Google services active: ${servicesLabel}`}>
              {servicesLabel}
            </span>
          </div>

          <textarea
            id="chat-input"
            ref={inputRef}
            value={input}
            rows={3}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(input);
              }
            }}
            placeholder="Type your message here..."
            aria-label="Ask a question about voter registration and eligibility"
            autoFocus
          />

          <div className="input-bottom">
            <div
              className="persona-toggle"
              onClick={() => setShowPersonaMenu(v => !v)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setShowPersonaMenu(v => !v);
                }
              }}
              aria-haspopup="menu"
              aria-expanded={showPersonaMenu}
              role="button"
              tabIndex={0}
            >
              <span>{userPersona ?? 'Select persona'}</span>
              <span className="material-symbols-rounded">expand_more</span>
            </div>
            {showPersonaMenu && (
              <div className="persona-menu" ref={menuRef} role="menu" aria-label="Choose persona">
                <div className="persona-menu-head">
                  <div className="pi-head-title">Choose persona</div>
                  <button className="persona-menu-close" onClick={() => setShowPersonaMenu(false)} aria-label="Close persona menu">✕</button>
                </div>
                <button type="button" className={`persona-item ${userPersona === 'First-time voter' ? 'active' : ''}`} onClick={() => { setPersona('First-time voter'); setShowPersonaMenu(false); }} role="menuitemradio" aria-checked={userPersona === 'First-time voter'}>
                  <span className="material-symbols-rounded">how_to_vote</span>
                  <div>
                    <div className="pi-title">First Time Voter</div>
                    <div className="pi-desc">Just turned 18 and voting for the first time</div>
                  </div>
                </button>
                <button type="button" className={`persona-item ${userPersona === 'Student' ? 'active' : ''}`} onClick={() => { setPersona('Student'); setShowPersonaMenu(false); }} role="menuitemradio" aria-checked={userPersona === 'Student'}>
                  <span className="material-symbols-rounded">school</span>
                  <div>
                    <div className="pi-title">Student</div>
                    <div className="pi-desc">Want to understand the election process better</div>
                  </div>
                </button>
                <button type="button" className={`persona-item ${userPersona === 'Working professional' ? 'active' : ''}`} onClick={() => { setPersona('Working professional'); setShowPersonaMenu(false); }} role="menuitemradio" aria-checked={userPersona === 'Working professional'}>
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
          {QUICK_START_ITEMS.map((p, i) => (
            <button
              key={i}
              type="button"
              className="chip"
              onClick={() => handleSendMessage(p.question)}
              aria-label={`Quick start question: ${p.question}`}
            >
              {p.question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
