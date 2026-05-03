import React, { useState, type ReactNode } from 'react';
import { STEPS, type Persona } from '../constants/steps';
import { JourneyContext } from './JourneyContext';

/**
 * JourneyProvider
 *
 * Provides the application-wide journey context, including the current step,
 * completed steps and the selected `userPersona`. Consumers should call
 * `useJourney()` (from `JourneyContext`) to access these helpers. Keep state
 * updates minimal and side-effect free so it's easy to test and reason about.
 */

export const JourneyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [userPersona, setUserPersona] = useState<Persona | null>(null);

  const goToStep = (step: number) => {
    if (step >= 0 && step < STEPS.length) {
      setCurrentStep(step);
      const newCompleted = Array.from({ length: step }, (_, i) => i);
      setCompletedSteps(prev => Array.from(new Set([...prev, ...newCompleted])));
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCompletedSteps(prev => Array.from(new Set([...prev, currentStep])));
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const setPersona = (persona: Persona) => {
    console.log('[Journey] setPersona ->', persona);
    setUserPersona(persona);
  };

  return (
    <JourneyContext.Provider value={{
      currentStep,
      completedSteps,
      userPersona,
      setPersona,
      goToStep,
      nextStep,
      prevStep,
      isFirstStep: currentStep === 0,
      isLastStep: currentStep === STEPS.length - 1
    }}>
      {children}
    </JourneyContext.Provider>
  );
};
