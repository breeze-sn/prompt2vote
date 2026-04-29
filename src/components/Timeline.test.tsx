import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Timeline } from './Timeline';

describe('Timeline', () => {
  it('renders all 4 steps', () => {
    render(<Timeline currentStep={0} onStepChange={vi.fn()} />);
    
    expect(screen.getByText('1. Eligibility')).toBeInTheDocument();
    expect(screen.getByText('2. Registration')).toBeInTheDocument();
    expect(screen.getByText('3. Voter ID')).toBeInTheDocument();
    expect(screen.getByText('4. Voting Day')).toBeInTheDocument();
  });

  it('calls onStepChange when a step is clicked', () => {
    const handleStepChange = vi.fn();
    render(<Timeline currentStep={0} onStepChange={handleStepChange} />);
    
    fireEvent.click(screen.getByText('3. Voter ID'));
    expect(handleStepChange).toHaveBeenCalledWith(2);
  });
});
