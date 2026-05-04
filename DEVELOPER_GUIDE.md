# Prompt2Vote - Developer Quick Reference

**Version:** 2.0.0  
**Last Updated:** May 4, 2026

---

## Quick Start

### Installation
```bash
git clone <repo>
cd prompt2vote
npm install
npm run dev
```

### Build & Test
```bash
npm run build       # Production build (613KB minified)
npm test -- --run   # Run all tests (22 tests, ~2.2s)
npm run preview     # Preview production build
```

---

## Project Structure

```
src/
├── components/
│   ├── App.tsx              # Main shell (auth, modals, layout)
│   ├── ChatAssistant.tsx    # Chat UI & message handling
│   ├── Timeline.tsx         # Journey progress indicator
│   ├── ErrorBoundary.tsx    # Error catching (NEW)
│   ├── AboutPage.tsx        # About section
│   ├── Guidelines.tsx       # Election guidelines modal
│   ├── Registration.tsx     # Registration help modal
│   └── ... (other modals)
├── context/
│   ├── JourneyContext.ts    # Persona/journey state
│   ├── JourneyProvider.tsx  # Context provider
│   └── AuthContext.ts       # Auth state (from Firebase)
├── services/
│   ├── gemini.ts            # Gemini API integration
│   ├── googleServices.ts    # Firebase setup
│   ├── cacheService.ts      # Response caching (NEW)
│   ├── rateLimitService.ts  # Rate limiting (NEW)
│   └── ... (tests)
└── utils/
    └── security.ts          # Input validation & XSS prevention
```

---

## Key Services

### 1. Gemini Integration (`gemini.ts`)

**Usage:**
```typescript
import { classifyQuestion, generateResponse } from '@/services/gemini';

// Classify a question
const classification = await classifyQuestion(userQuestion);
// Returns: {category, confidence, isRelevant}

// Generate response
const response = await generateResponse(question, context);
// Returns: {answer, sources, confidence}
```

**Features:**
- Multi-model fallback (2.0-flash → 1.5-flash → 1.5-pro → 1.0-pro)
- Pre-cached responses for common questions
- Structured output for classification
- Error handling with user messages

---

### 2. Response Caching (`cacheService.ts`)

**Usage:**
```typescript
import { getCachedResponse, setCachedResponse, getCacheStats } from '@/services/cacheService';

// Check cache first
let response = getCachedResponse('What is voter eligibility?');

// If not cached, generate and cache
if (!response) {
  response = await generateResponse(question, context);
  setCachedResponse(question, response, 86400000); // 24h TTL
}

// Monitor cache stats
console.log(getCacheStats()); // {size: 5, entries: [...]}
```

**Features:**
- 50-item limit with auto-pruning
- 7-day default TTL
- Hash-based key lookup (O(1))
- localStorage persistence (graceful fallback)

---

### 3. Rate Limiting (`rateLimitService.ts`)

**Usage:**
```typescript
import { rateLimiter, checkRateLimit } from '@/services/rateLimitService';

// Check if request allowed
const {allowed, remainingRequests, resetInMs} = checkRateLimit(userId, '/api/gemini');

if (!allowed) {
  console.error(`Rate limited. Reset in ${resetInMs}ms`);
  return;
}

// Make request
const response = await generateResponse(question, context);
```

**Configuration:**
- 20 requests/minute (hard limit)
- 5 requests/10 seconds (burst protection)
- Per-user isolation
- In-memory (resets on page refresh)

**For admin adjustments:**
```typescript
// In rateLimitService.ts, line 10-11
private readonly requestsPerMinute = 20;  // Adjust as needed
private readonly requestsPerBurst = 5;    // Adjust as needed
```

---

### 4. Security (`security.ts`)

**Usage:**
```typescript
import { sanitizeInput, isValidQuestion, isWhitelistedLink } from '@/utils/security';

// Sanitize user input
const safe = sanitizeInput(userInput);

// Validate questions
if (!isValidQuestion(question)) {
  console.warn('Invalid question detected');
  return;
}

// Check external links
if (isWhitelistedLink(url)) {
  window.open(url, '_blank');
}
```

**Features:**
- XSS prevention (HTML escape)
- 1000 character limit
- Link whitelist (eci.gov.in only)
- Input length validation

---

## State Management

### Journey Context

```typescript
const { persona, step, currentUser, setPersona, setStep } = useContext(JourneyContext);

// Available personas: 'first_time_voter' | 'student' | 'professional'
// Available steps: see src/constants/steps.ts
```

### Auth Context

```typescript
const { user, isGuest, signInWithGoogle, signOut } = useContext(AuthContext);

// user: Firebase User object (null if not logged in)
// isGuest: boolean (true if guest mode)
```

---

## Testing

### Run Tests
```bash
npm test -- --run              # Run once
npm test                        # Watch mode
npm test -- --ui               # UI mode
```

### Test Files
- `src/utils/security.test.ts` - Input validation
- `src/services/gemini.test.ts` - API mocking
- `src/services/rateLimitService.test.ts` - Rate limiting
- `src/services/googleServices.test.ts` - Firebase
- `src/components/*.test.tsx` - Component tests

### Add New Tests
```bash
# Create test file
touch src/services/myService.test.ts

# Example test
import { describe, it, expect } from 'vitest';
import { myFunction } from './myService';

describe('myService', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });
});
```

---

## Common Tasks

### Add New Modal Dialog

1. **Create component:**
```tsx
// src/components/MyModal.tsx
export function MyModal({ isOpen, onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box">
        <h2 className="modal-title">Title</h2>
        {/* Content */}
      </div>
    </div>
  );
}
```

2. **Add styling (in App.css):**
```css
/* Styles already defined, reuse modal-* classes */
.modal-overlay { /* existing */ }
.modal-box { /* existing */ }
.modal-title { /* existing */ }
```

3. **Integrate in App.tsx:**
```tsx
{showMyModal && <MyModal isOpen={showMyModal} onClose={() => setShowMyModal(false)} />}
```

### Add New Question Classification

1. **Update gemini.ts:**
```typescript
// In classifyQuestion() function, add:
if (question.toLowerCase().includes('keyword')) {
  return {
    category: 'new_category',
    confidence: 0.9,
    isRelevant: true
  };
}
```

2. **Add test:**
```typescript
it('should classify new category', async () => {
  const result = await classifyQuestion('keyword question');
  expect(result.category).toBe('new_category');
});
```

### Fix a Bug

1. **Find the bug in code/tests**
2. **Write a failing test first:**
```bash
npm test -- --watch
# Test should fail
```

3. **Fix the code**
4. **Verify test passes:**
```bash
npm test -- --run
```

5. **Commit with clear message:**
```bash
git commit -m "fix: [description of bug fix]"
```

---

## Environment Variables

### Client-Side (.env.local)
```env
VITE_GEMINI_API_KEY=AIzaSy...
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_PROJECT_ID=prompt2vote
# All Firebase keys
```

### Firebase Configuration

```bash
firebase init  # Already done
firebase login
firebase use prompt2vote
```

---

## Debugging

### Browser DevTools

1. **Network tab:**
   - Check Gemini API calls
   - Verify Firestore requests
   - Monitor rate limit headers

2. **Console tab:**
   - Look for security warnings
   - Check rate limit messages
   - Verify cache operations

3. **Sources tab:**
   - Set breakpoints in services
   - Step through auth flow
   - Debug chat logic

### Debug Logging

```typescript
// Temporary logging (remove before commit)
console.debug('[gemini] Classification:', classification);
console.log('[cache] Cache stats:', getCacheStats());
console.warn('[rate-limit] Rate limited:', userId);
```

### Firebase Emulator (Local Testing)

```bash
firebase emulators:start --only firestore
# Then update Firebase config to point to localhost:8080
```

---

## Performance Tips

### Cache Responses
```typescript
// Check cache before API call
const cached = getCachedResponse(question);
if (cached) return cached;

// Expensive operation
const response = await generateResponse(question);

// Cache result
setCachedResponse(question, response);
```

### Avoid Rate Limits
```typescript
// Check before making request
const {allowed} = checkRateLimit(userId, endpoint);
if (!allowed) {
  // Show error to user
  return;
}
```

### Monitor Bundle Size
```bash
npm run build
# Watch for warnings about chunk size
# Consider lazy loading large components
```

---

## Common Errors & Solutions

### Error: "Rate Limited"
- User made too many requests
- Wait before retrying
- Check rate limit config in rateLimitService.ts

### Error: "Firestore permission denied"
- Security rules blocking access
- Check: user logged in? owns document? valid request?
- Review firestore.rules

### Error: "Invalid API Key"
- Check .env.local has VITE_GEMINI_API_KEY
- Verify key is valid in Google Cloud Console
- Try regenerating key

### Error: "localStorage not available"
- Normal in test environment
- Cache service handles gracefully
- No action needed

### Build Error: "52 modules..."
- This is expected output
- Shows successful build
- Bundle size warnings are informational

---

## Useful Commands

```bash
# Development
npm run dev                # Start dev server on :5173
npm run preview           # Preview production build

# Production
npm run build             # Build for production
npm run build:watch      # Watch mode

# Testing
npm test                  # Watch mode
npm test -- --run        # Single run
npm test -- --ui         # UI mode

# Firebase
firebase deploy          # Deploy everything
firebase deploy --only hosting  # Just hosting
firebase deploy --only firestore:rules  # Just rules

# Git
git status
git add .
git commit -m "feat: description"
git push origin main
```

---

## Links & Resources

- **Firebase Console:** https://console.firebase.google.com/project/prompt2vote
- **Gemini API Docs:** https://ai.google.dev
- **Vitest Docs:** https://vitest.dev
- **React Docs:** https://react.dev
- **TypeScript Docs:** https://www.typescriptlang.org/docs

---

## Key Files to Know

| File | Purpose | Edit When |
|------|---------|-----------|
| `src/App.tsx` | Main shell | Add features, change layout |
| `src/App.css` | All styles | Update theme, add modals |
| `src/services/gemini.ts` | AI responses | Tweak prompts, add classifications |
| `src/services/rateLimitService.ts` | Rate limiting | Adjust limits |
| `firestore.rules` | Security | Tighten/relax access control |
| `firebase.json` | Firebase config | Configure hosting, redirects |

---

## Troubleshooting Workflow

1. **Check error message** - What does it tell you?
2. **Google the error** - Is it a known issue?
3. **Check Console tab** - More detailed errors?
4. **Check Network tab** - Did requests succeed?
5. **Check Firestore rules** - Is access blocked?
6. **Check rate limiter** - Too many requests?
7. **Restart dev server** - Sometimes helps
8. **Clear cache** - `rm -rf .vite node_modules/.vite`
9. **Check .env.local** - All API keys present?
10. **Ask in PR comments** - Team can help

---

**Happy coding! 🚀**
