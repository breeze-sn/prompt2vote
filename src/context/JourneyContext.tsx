import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { STEPS, type Persona } from '../constants/steps';

interface JourneyContextType {
  currentStep: number;
  completedSteps: number[];
  userPersona: Persona | null;
  setPersona: (persona: Persona) => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const JourneyContext = createContext<JourneyContextType | undefined>(undefined);

export const JourneyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [userPersona, setUserPersona] = useState<Persona | null>(null);

  const goToStep = (step: number) => {
    if (step >= 0 && step < STEPS.length) {
      setCurrentStep(step);
      // Mark all previous steps as completed
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

export const useJourney = () => {
  const context = useContext(JourneyContext);
  if (context === undefined) {
    throw new Error('useJourney must be used within a JourneyProvider');
  }
  return context;
};
