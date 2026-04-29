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
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Hello! I am Clara, your Prompt2Vote assistant. I see you are at the **${STEPS[currentStep]}** step. How can I help you?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getStepGuidance = (step: number) => {
    switch(step) {
      case 0: return "We'll check if you meet the age and residency requirements.";
      case 1: return "I can help you find your local registration office or online portal.";
      case 2: return "Let's make sure you have the right documents for voting day.";
      case 3: return "Today is the big day! Ready for the simulation?";
      default: return "";
    }
  };

  // Sync chat when step changes
  useEffect(() => {
    const stepName = STEPS[currentStep];
    const guidance = `You are now in the **${stepName}** step. ${getStepGuidance(currentStep)}`;
    
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: guidance }
      ]);
    }, 0);
  }, [currentStep]);

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
