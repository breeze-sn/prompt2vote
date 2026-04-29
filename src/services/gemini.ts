import { GoogleGenerativeAI } from "@google/generative-ai";
import { STEPS } from '../constants/steps';

// Initialize the Gemini API
// Note: In a production app, you should use a backend to proxy these requests
// and keep your API key secure. For this hackathon prototype, we use VITE_GEMINI_API_KEY.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

const ELECTION_FACTS = `
ELECTION RULES FOR INDIA:
- Minimum Voting Age: 18 years.
- Registration Portal: National Voters' Service Portal (NVSP) at https://www.nvsp.in/
- Form: Form 6 is used for new registration as a general voter.
- Identity Proofs: Aadhaar Card, PAN Card, Driving License, Passport, MNREGA Job Card, Health Insurance Smart Card, etc.
- Current Journey Steps in App: ${STEPS.join(', ')}.
`;

const SYSTEM_INSTRUCTION = `
You are Clara, the Smart Election Companion for the Prompt2Vote app. 
Your mission is to guide users through the electoral process in India accurately and safely.

CORE RULES:
1. NO HALLUCINATION: Only provide information based on official Indian election guidelines. If you are unsure, say you don't know and refer them to the Election Commission of India (ECI).
2. AGE CHECK: If a user mentions being under 18, strictly inform them they are ineligible to vote. Do not provide voting shortcuts.
3. PERSONA AWARE: Adapt your tone to the user's persona (e.g., Student, First-time voter, Senior Citizen).
4. CONTEXT AWARE: You know the user is currently at a specific step in their "Journey." Use this to provide relevant advice.
5. NO LINKS: Do not provide links to unofficial third-party websites. Only mention NVSP or official ECI portals.

Factual Grounding:
${ELECTION_FACTS}
`;

export const generateChatResponse = async (
  prompt: string, 
  persona: string | null, 
  currentStep: number
): Promise<string> => {
  
  // FALLBACK TO MOCK if no API key is provided
  if (!genAI || !API_KEY) {
    console.warn("Gemini API key missing or undefined. Falling back to mock response.");
    return mockResponse(prompt, persona || 'User', currentStep);
  }

  // Try multiple models in case of 404 (Optimized for this key's access)
  const modelsToTry = [
    "gemini-flash-latest",
    "gemini-pro-latest",
    "gemini-2.5-flash", 
    "gemini-2.0-flash", 
    "gemini-1.5-flash"
  ];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: modelName,
      });

      const fullPrompt = `${SYSTEM_INSTRUCTION}\n\n` +
                         `User Persona: ${persona || 'General Voter'}\n` +
                         `Current Journey Step: ${STEPS[currentStep]}\n` +
                         `User Message: ${prompt}`;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error(`Gemini Error with model ${modelName}:`, error);
      lastError = error;
      // If it's a 404, try next model. Otherwise, throw.
      if (!error?.message?.includes('404')) {
        break;
      }
    }
  }

  const errorMessage = lastError?.message || "Unknown error";
  return `I'm having trouble connecting to my AI core. Error: ${errorMessage}. Please check your internet connection or ensure your API key is valid. Key present: ${!!API_KEY}`;
};

// Simplified mock response as a safe fallback
const mockResponse = (prompt: string, persona: string, currentStep: number): string => {
  const lower = prompt.toLowerCase();
  if (lower.includes('age') || /\b\d{1,2}\b/.test(lower)) {
    return "I noticed you mentioned age. In India, you must be at least 18 to vote. If you're eligible, your first step is registration via NVSP.";
  }
  return `As a ${persona} at the "${STEPS[currentStep]}" stage, I recommend following the official ECI guidelines. Please add a Gemini API key to see my full AI capabilities!`;
};
