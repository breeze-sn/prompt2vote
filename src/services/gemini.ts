/**
 * Gemini service wrapper
 *
 * This module wraps calls to Google's Generative AI (Gemini). For local
 * development or when an API key is not provided, the code falls back to a
 * deterministic `mockResponse` implementation so the UI remains usable.
 *
 * Configure your Gemini key in the environment as `VITE_GEMINI_API_KEY`.
 */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { STEPS } from '../constants/steps';
import { QUICK_START_ITEMS } from '../constants/quickStart';
import { sanitizeUserInput } from '../utils/security';

// Initialize the Gemini API
// Note: In a production app, you should use a backend to proxy these requests
// and keep your API key secure. For this hackathon prototype, we use VITE_GEMINI_API_KEY.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Response cache to reduce API calls for duplicate questions
const responseCache = new Map<string, string>();
const getCacheKey = (prompt: string, persona: string | null, step: number): string =>
  `${prompt.toLowerCase().trim()}|${persona}|${step}`;

const ELECTION_FACTS = `
ELECTION RULES FOR INDIA:
- Minimum Voting Age: 18 years.
- Registration Portal: National Voters' Service Portal (NVSP) at https://www.nvsp.in/
- Form: Form 6 is used for new registration as a general voter.
- Identity Proofs: Aadhaar Card, PAN Card, Driving License, Passport, MNREGA Job Card, Health Insurance Smart Card, etc.
- Current Journey Steps in App: ${STEPS.join(', ')}.
`;

const SYSTEM_INSTRUCTION = `
You are Clara, Prompt2Vote's AI election assistant.

VOICE:
- Calm, precise, civic-first.
- Actionable, step-based guidance.

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
  const safePrompt = sanitizeUserInput(prompt);

  if (!safePrompt) {
    return 'Please type a question about elections or voter services.';
  }

  if (safePrompt.length > 1000) {
    return 'Your question is too long. Please shorten it to keep the assistant focused and secure.';
  }

  // Check response cache to avoid duplicate API calls
  const cacheKey = getCacheKey(safePrompt, persona, currentStep);
  const cachedResponse = responseCache.get(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Quick-start preset answers (no API call)
  const norm = safePrompt.toLowerCase();
  // Greet and gratitude handling: reply locally without calling the model
  const greetRegex = /\b(hi|hello|hey|good morning|good afternoon|good evening|greetings)\b/;
  const thanksRegex = /\b(thanks|thank you|thx|cheers)\b/;
  if (greetRegex.test(norm)) {
    const greetResp = "Hello — thanks for reaching out! How can I help with election-related questions today?";
    responseCache.set(cacheKey, greetResp);
    return greetResp;
  }
  if (thanksRegex.test(norm)) {
    const thanksResp = "You're welcome — happy to help with election questions. Ask me anything about registration, voter ID, polling, NVSP, or NOTA.";
    responseCache.set(cacheKey, thanksResp);
    return thanksResp;
  }
  const preset = QUICK_START_ITEMS.find(item => item.keywords.some(k => norm.includes(k)) || norm === item.question.trim().toLowerCase());
  if (preset) {
    responseCache.set(cacheKey, preset.answer);
    return preset.answer;
  }

  // Domain guard: only answer election-related queries
  const ELECTION_KEYWORDS = ['vote', 'voter', 'voting', 'registration', 'nvsp', 'voter id', 'epic', 'election', 'poll', 'nota', 'form 6', 'form6'];
  const isElection = ELECTION_KEYWORDS.some(k => norm.includes(k));
  if (!isElection) {
    const outOfScopeResp = "I'm focused on election-related help only. Please ask about registration, voter ID, polling, NVSP, NOTA, or similar topics.";
    responseCache.set(cacheKey, outOfScopeResp);
    return outOfScopeResp;
  }

  // FALLBACK TO MOCK if no API key is provided
  if (!genAI || !API_KEY) {
    console.warn("Gemini API key missing or undefined. Falling back to mock response.");
    const mockResp = mockResponse(prompt, persona || 'User', currentStep);
    responseCache.set(cacheKey, mockResp);
    return mockResp;
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
        `User Message: ${safePrompt}`;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      // Simple hallucination guard: if the model hedges or uses uncertain language, refuse and point to official sources
      const hedgePhrases = ['i think', "i'm not sure", 'maybe', 'might', 'possibly', 'as far as i know', 'could be', 'probably', 'usually', 'often', 'generally'];
      const lowerText = text.toLowerCase();
      if (hedgePhrases.some(p => lowerText.includes(p))) {
        return "I couldn't produce a fully confident answer. Please check official sources (eci.gov.in or voters.eci.gov.in) or rephrase your question with specific details.";
      }

      const unsafeClaims = ['according to me', 'as an ai', 'i cannot verify', 'i do not know', 'not sure'];
      if (unsafeClaims.some(p => lowerText.includes(p))) {
        const secureResp = "I can only provide verified election guidance. Please refer to eci.gov.in or voters.eci.gov.in for official details.";
        responseCache.set(cacheKey, secureResp);
        return secureResp;
      }

      // Cache the successful response
      responseCache.set(cacheKey, text);
      return text;
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

// Expanded mock response as a safe fallback for common questions
const mockResponse = (prompt: string, _persona: string, _currentStep: number): string => {
  const lower = sanitizeUserInput(prompt).toLowerCase();

  // Eligibility
  if (lower.includes('age') || lower.includes('eligible') || lower.includes('qualify')) {
    return "• Must be 18+ on the qualifying date.\n• Must be an Indian citizen.\n• Must be an ordinary resident of the constituency.\n• Not disqualified by any law.";
  }

  // Registration
  if (lower.includes('register') || lower.includes('form 6') || lower.includes('apply')) {
    return "• Use Form 6 for new voter registration.\n• Apply online at voters.eci.gov.in.\n• Upload photo, age proof, and address proof.\n• Track status using reference ID.";
  }

  // Documents
  if (lower.includes('document') || lower.includes('id') || lower.includes('proof')) {
    return "• Photo ID: Aadhaar, PAN, Passport, or DL.\n• Age Proof: Birth Certificate or Class 10th marksheet.\n• Address Proof: Electricity bill or Water bill.\n• EPIC (Voter ID) is the primary document.";
  }

  // Voting Process
  if (lower.includes('how to vote') || lower.includes('process') || lower.includes('booth')) {
    return "• Locate your booth on the ECI website.\n• Carry your Voter ID or valid Govt ID.\n• First officer checks your name in the list.\n• Second officer inks your finger and takes signature.\n• Third officer enables the EVM.\n• Press the button next to your candidate's symbol.";
  }

  // NOTA
  if (lower.includes('nota') || lower.includes('none of the above')) {
    return "• NOTA (None of the Above) is at the end of the candidate list.\n• It allows you to express dissent against all candidates.\n• It is a constitutional right for every voter.";
  }

  // Deadlines & Dates
  if (lower.includes('date') || lower.includes('when') || lower.includes('deadline')) {
    return "• Registration usually closes 2-3 weeks before election day.\n• Check eci.gov.in for specific schedule in your state.\n• General elections are held every 5 years.";
  }

  // Default Fallback
  return "• Visit voters.eci.gov.in for official status and forms.\n• Ensure you have a valid ID (Aadhaar/EPIC) ready.\n• Use the 'Guidelines' section in the sidebar for more details.\n• Gemini Cloud is currently offline, providing cached common answers.";
};
