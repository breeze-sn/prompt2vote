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
You are Prompt2Vote, a minimalist AI election assistant. 

ULTRA-CONCISE RULES:
1. NO INTRODUCTIONS: Do not say "I am Clara", "Hello", or "As your assistant". Start directly with the answer.
2. MINIMALIST FORMAT: Use bullet points for everything. Keep each point under 10 words.
3. RUSH MODE: Provide only the most critical actions. No small talk or background context unless essential.
4. NO HALLUCINATION: Only official Indian election facts. Refer to ECI/NVSP for everything else.
5. AGE CHECK: Strictly enforce 18+ eligibility.

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

  // Valid Gemini model IDs (ordered by preference)
  const modelsToTry = [
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-1.0-pro"
  ];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_INSTRUCTION,
      });

      const fullPrompt =
        `User Persona: ${persona || 'General Voter'}\n` +
        `Current Journey Step: ${STEPS[currentStep] ?? 'General'}\n` +
        `User Message: ${prompt}`;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error(`Gemini [${modelName}]:`, error?.message ?? error);
      lastError = error;
      // only skip to next model on 404 / model-not-found errors
      const msg: string = error?.message ?? '';
      if (!msg.includes('404') && !msg.includes('not found') && !msg.includes('MODEL_NOT_FOUND')) {
        break;
      }
    }
  }

  const errorMessage = lastError?.message || "Unknown error";
  return `I'm having trouble connecting to my AI core. Error: ${errorMessage}. Please check your internet connection or ensure your API key is valid. Key present: ${!!API_KEY}`;
};

// Simplified mock response as a safe fallback
const mockResponse = (prompt: string, _persona: string, _currentStep: number): string => {
  const lower = prompt.toLowerCase();
  if (lower.includes('age') || /\b\d{1,2}\b/.test(lower)) {
    return "• Must be 18+ to vote.\n• Register via NVSP portal.\n• Verification takes 2-4 weeks.";
  }
  return "• Visit voters.eci.gov.in for official status.\n• Ensure you have valid ID (Aadhaar/EPIC).\n• Connect Gemini API key for real-time guidance.";
};
