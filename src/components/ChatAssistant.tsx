import React, { useState } from 'react';
import { generateChatResponse } from '../services/gemini';
import { useJourney } from '../context/JourneyContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const PRESETS = [
  'I just turned 18, what should I do?',
  'How do I register to vote?',
  'What should I carry on voting day?',
];

const clean = (text: string) =>
  text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');

export const ChatAssistant: React.FC = () => {
  const { currentStep, userPersona } = useJourney();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);

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

  React.useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading]);

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
              <div key={i} className="gemini-message user">{msg.content}</div>
            ) : (
              <div key={i} className="gemini-message assistant">
                <div className="bot-label">Clara</div>
                <div className="bot-content-wrapper">
                  <div className="bot-avatar" />
                  <div className="bot-text">{msg.content}</div>
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
            <div className="persona-toggle">
              <span>{userPersona}</span>
              <span className="material-symbols-rounded">expand_more</span>
            </div>
            <div className="mic-icon">
              <span className="material-symbols-rounded">mic</span>
            </div>
          </div>
        </div>

        {/* Preset chips */}
        <div className="preset-chips">
          {PRESETS.map((p, i) => (
            <button key={i} className="chip" onClick={() => send(p)}>{p}</button>
          ))}
        </div>
      </div>
    </div>
  );
};
