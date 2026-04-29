import React, { useState, useEffect } from 'react';
import { generateChatResponse } from '../services/gemini';
import { useJourney } from '../context/JourneyContext';
import { STEPS } from '../constants/steps';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const PRESETS = [
  "I just turned 18, what should I do?",
  "How do I register to vote?"
];

export const ChatAssistant: React.FC = () => {
  const { currentStep, userPersona } = useJourney();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (text: string) => {
    if (!text.trim() || !userPersona) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateChatResponse(text, userPersona, currentStep);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="gemini-chat-container">
      {messages.length === 0 ? (
        <div className="gemini-welcome">
          <h1 className="greeting">Hello there!</h1>
          <h2 className="sub-greeting">How can I help you?</h2>
        </div>
      ) : (
        <div className="gemini-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`gemini-message ${msg.role}`}>
              <div className="avatar">{msg.role === 'assistant' ? '🤖' : '👤'}</div>
              <div className="content">{msg.content}</div>
            </div>
          ))}
          {isLoading && <div className="gemini-message assistant">Thinking...</div>}
        </div>
      )}

      <div className="gemini-input-wrapper">
        <div className="gemini-input-box">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(input);
              }
            }}
            placeholder="Ask a Question..."
            rows={1}
          />
          <div className="input-footer">
            <div className="persona-chip">
              {userPersona} <span className="arrow">▾</span>
            </div>
            <div className="input-actions">
              <span className="mic-icon">🎤</span>
            </div>
          </div>
        </div>

        <div className="gemini-presets">
          {PRESETS.map((preset, idx) => (
            <button 
              key={idx} 
              className="gemini-chip" 
              onClick={() => handleSend(preset)}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
