import React from 'react';
import { useJourney } from '../context/JourneyContext';
import { STEPS } from '../constants/steps';

export const Timeline: React.FC = () => {
  const { currentStep, completedSteps, goToStep } = useJourney();

  return (
    <div className="timeline-list">
      {STEPS.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = completedSteps.includes(index);
        
        let className = 'timeline-step';
        if (isActive) className += ' active';
        if (isCompleted) className += ' completed';

        return (
          <button
            key={step}
            className={className}
            onClick={() => goToStep(index)}
            aria-current={isActive ? 'step' : undefined}
          >
            <span className="step-number">{index + 1}</span>
            <span className="step-label">{step}</span>
          </button>
        );
      })}
    </div>
  );
};
