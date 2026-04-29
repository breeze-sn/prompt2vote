import React, { useState } from 'react';
import { generateChatResponse } from '../services/gemini';
import { Persona } from '../App';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatProps {
  persona: Persona;
  currentStep: number;
}

const PRESETS = [
  "I just turned 18, what should I do?",
  "How do I register to vote?"
];

export const ChatAssistant: React.FC<ChatProps> = ({ persona, currentStep }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am Clara, your Prompt2Vote assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateChatResponse(text, persona, currentStep);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {isLoading && <div className="message assistant">Thinking...</div>}
      </div>

      <div className="presets">
        {PRESETS.map((preset, idx) => (
          <button 
            key={idx} 
            className="preset-btn" 
            onClick={() => handleSend(preset)}
            disabled={isLoading}
          >
            {preset}
          </button>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
          placeholder="Ask a question..."
          disabled={isLoading}
        />
        <button onClick={() => handleSend(input)} disabled={isLoading || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
};
