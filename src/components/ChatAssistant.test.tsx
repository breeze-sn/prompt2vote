import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatAssistant } from './ChatAssistant';
import { JourneyProvider } from '../context/JourneyContext';

const renderChat = () => {
  return render(
    <JourneyProvider>
      <ChatAssistant />
    </JourneyProvider>
  );
};

describe('ChatAssistant', () => {
  it('renders the initial assistant message with step name', () => {
    renderChat();
    expect(screen.getByText(/Hello! I am Clara, your Prompt2Vote assistant/)).toBeInTheDocument();
    expect(screen.getByText(/Eligibility/)).toBeInTheDocument();
  });

  it('allows user to send a message', async () => {
    renderChat();
    
    const input = screen.getByPlaceholderText('Ask a question...');
    fireEvent.change(input, { target: { value: 'Test message' } });
    
    const button = screen.getByText('Send');
    fireEvent.click(button);
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });
});
