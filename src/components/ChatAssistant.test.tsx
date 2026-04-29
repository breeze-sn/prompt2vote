import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatAssistant } from './ChatAssistant';

describe('ChatAssistant', () => {
  it('renders the initial assistant message', () => {
    render(<ChatAssistant persona="Student" currentStep={0} />);
    expect(screen.getByText('Hello! I am Clara, your Prompt2Vote assistant. How can I help you today?')).toBeInTheDocument();
  });

  it('allows user to send a message', () => {
    render(<ChatAssistant persona="Student" currentStep={0} />);
    
    const input = screen.getByPlaceholderText('Ask a question...');
    fireEvent.change(input, { target: { value: 'Test message' } });
    
    const button = screen.getByText('Send');
    fireEvent.click(button);
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });
});
