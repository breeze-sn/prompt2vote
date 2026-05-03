export type QuickStartItem = {
  question: string;
  answer: string;
  keywords: string[];
};

export const QUICK_START_ITEMS: QuickStartItem[] = [
  {
    question: 'I just turned 18, what should I do?',
    answer:
      '• Congratulations — you are eligible to register.\n• Use Form 6 to apply as a new voter.\n• Register online at voters.eci.gov.in (NVSP) or submit the form at your local registration office.\n• Keep a valid ID and proof of age ready.',
    keywords: ['i just turned 18', 'turned 18', 'what should i do', 'new voter'],
  },
  {
    question: 'How do I register to vote?',
    answer:
      '• Use Form 6 for new voter registration.\n• Apply online at voters.eci.gov.in or NVSP.\n• Upload photo, age proof, and address proof.\n• Track status with the reference ID.',
    keywords: ['how do i register', 'register to vote', 'form 6', 'registration'],
  },
  {
    question: 'What should I carry on voting day?',
    answer:
      '• Carry your EPIC (Voter ID) or another valid government photo ID (Aadhaar, Passport, DL, PAN).\n• Bring any appointment or reference proof if asked.\n• Keep mobile phones outside the polling booth as per rules.',
    keywords: ['what should i carry', 'voting day', 'carry on voting day', 'booth'],
  },
];

export const QUICK_START_BY_KEYWORD = QUICK_START_ITEMS;