// This is a mock integration for the Gemini service
// Replace with actual API call later.

export const generateChatResponse = async (
  prompt: string, 
  persona: string, 
  currentStep: number
): Promise<string> => {
  
  // Simulating API latency
  await new Promise(resolve => setTimeout(resolve, 800));

  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes('18')) {
    return "Congratulations on turning 18! As a first-time voter, your first step is to check your eligibility and register to vote in your state. You can usually do this online or by mail.";
  }

  if (lowerPrompt.includes('register')) {
    return "To register to vote, you'll need to provide proof of identity (like a driver's license or SSN). Check your local election website for specific deadlines and online registration portals.";
  }

  // Generic fallback based on persona
  return `As a ${persona} currently looking at step ${currentStep + 1}, I recommend making sure your paperwork is in order. Do you have any specific questions about this step?`;
};
