import { createContext, useContext } from 'react';
import type { Persona } from '../constants/steps';

export interface JourneyContextType {
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

export const JourneyContext = createContext<JourneyContextType | undefined>(undefined);

export const useJourney = () => {
  const context = useContext(JourneyContext);
  if (context === undefined) {
    throw new Error('useJourney must be used within a JourneyProvider');
  }
  return context;
};
