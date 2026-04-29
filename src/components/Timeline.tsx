import React from 'react';

interface TimelineProps {
  currentStep: number;
  onStepChange: (step: number) => void;
}

const STEPS = [
  'Eligibility',
  'Registration',
  'Voter ID',
  'Voting Day'
];

export const Timeline: React.FC<TimelineProps> = ({ currentStep, onStepChange }) => {
  return (
    <div className="timeline-list">
      {STEPS.map((step, index) => {
        let className = 'timeline-step';
        if (index === currentStep) className += ' active';
        else if (index < currentStep) className += ' completed';

        return (
          <button
            key={step}
            className={className}
            onClick={() => onStepChange(index)}
            aria-current={index === currentStep ? 'step' : undefined}
          >
            {index + 1}. {step}
          </button>
        );
      })}
    </div>
  );
};
