import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ChatAssistant } from './ChatAssistant';
import { JourneyProvider } from '../context/JourneyProvider';

const renderChat = () =>
  render(
    <JourneyProvider>
      <ChatAssistant messages={[]} loading={false} onSendMessage={async () => {}} />
    </JourneyProvider>
  );

describe('ChatAssistant', () => {
  it('renders the landing greeting before any messages', () => {
    renderChat();

    expect(screen.getByText("Hi, I'm Clara.")).toBeInTheDocument();
    expect(screen.getByText('How can I help you vote with confidence?')).toBeInTheDocument();
  });

  it('calls onSendMessage when preset is clicked', async () => {
    let capturedText = '';
    const mockOnSend = async (text: string) => {
      capturedText = text;
    };

    render(
      <JourneyProvider>
        <ChatAssistant messages={[]} loading={false} onSendMessage={mockOnSend} />
      </JourneyProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /Quick start question: How do I register to vote\?/i }));

    // Wait for async handler
    await new Promise(r => setTimeout(r, 50));
    expect(capturedText).toBe('How do I register to vote?');
  });

  it('keeps the persona picker accessible from the keyboard', () => {
    renderChat();

    const personaToggle = screen.getByRole('button', { name: /Select persona/i });
    personaToggle.focus();
    fireEvent.keyDown(personaToggle, { key: 'Enter' });

    expect(screen.getByRole('menu', { name: /Choose persona/i })).toBeInTheDocument();
  });
});