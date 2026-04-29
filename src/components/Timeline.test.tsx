import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Timeline } from './Timeline';
import { JourneyProvider } from '../context/JourneyContext';

const renderTimeline = () => {
  return render(
    <JourneyProvider>
      <Timeline />
    </JourneyProvider>
  );
};

describe('Timeline', () => {
  it('renders all steps', () => {
    renderTimeline();
    
    expect(screen.getByText('Eligibility')).toBeInTheDocument();
    expect(screen.getByText('Registration')).toBeInTheDocument();
    expect(screen.getByText('Voter ID')).toBeInTheDocument();
    expect(screen.getByText('Voting Day')).toBeInTheDocument();
  });

  it('updates state when a step is clicked', () => {
    renderTimeline();
    
    const step = screen.getByText('Voter ID');
    fireEvent.click(step);
    
    // The step should now have the 'active' class (on its parent button)
    const button = step.closest('button');
    expect(button).toHaveClass('active');
  });
});
