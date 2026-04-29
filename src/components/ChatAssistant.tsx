import React, { useState, useRef, useEffect } from 'react';
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
  const bottomRef               = useRef<HTMLDivElement>(null);
  const textareaRef             = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages(prev => [...prev, { role: 'user', content: trimmed }]);
    setInput('');
    setLoading(true);
    try {
      const res = await generateChatResponse(trimmed, userPersona, currentStep);
      setMessages(prev => [...prev, { role: 'assistant', content: clean(res) }]);
    } catch (e: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠ ${e?.message ?? 'Could not reach AI. Check internet connection.'}`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">

      {/* ── Messages / Greeting ── */}
      <div className="chat-scroll">
        {messages.length === 0 && !loading ? (
          <div className="chat-greeting">
            <h1>Hello there!</h1>
            <h2>How can I help you?</h2>
          </div>
        ) : (
          <>
            {messages.map((msg, i) =>
              msg.role === 'user' ? (
                <div key={i} className="msg-user">{msg.content}</div>
              ) : (
                <div key={i} className="msg-bot">
                  <div className="msg-bot-header">
                    <div className="bot-dot" />
                    <span className="bot-name-label">Clara</span>
                  </div>
                  <div className="msg-bot-body">{msg.content}</div>
                </div>
              )
            )}

            {loading && (
              <div className="msg-bot">
                <div className="msg-bot-header">
                  <div className="bot-dot dot-pulse" />
                  <span className="bot-name-label">Clara</span>
                </div>
                <div className="shimmer-wrap">
                  <div className="shimmer-bar" />
                  <div className="shimmer-bar shimmer-short" />
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div className="chat-input-area">
        <div className="chat-input-box">
          {/* Header label row */}
          <div className="cib-header">
            <span className="material-symbols-rounded cib-icon">verified_user</span>
            <span className="cib-hint">Ask a question about voting…</span>
          </div>

          {/* Actual textarea — full width, transparent */}
          <textarea
            ref={textareaRef}
            className="cib-textarea"
            value={input}
            rows={3}
            placeholder=""
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
          />

          {/* Footer row */}
          <div className="cib-footer">
            <button className="cib-persona">
              {userPersona}
              <span className="material-symbols-rounded">expand_more</span>
            </button>
            <button
              className={`cib-send ${input.trim() ? 'active' : ''}`}
              onClick={() => send(input)}
              disabled={loading}
            >
              {input.trim()
                ? <span className="material-symbols-rounded">send</span>
                : <span className="material-symbols-rounded">mic</span>
              }
            </button>
          </div>
        </div>

        {/* Preset chips */}
        {messages.length === 0 && (
          <div className="chip-row">
            {PRESETS.map((p, i) => (
              <button key={i} className="chip" onClick={() => send(p)}>{p}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
