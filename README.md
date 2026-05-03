# Prompt2Vote 🗳️

**Prompt2Vote** is an AI-powered **Smart Election Companion** designed to simplify and gamify the civic journey. This project was developed as part of the **Prompt Wars** hackathon to address the complexity and friction often associated with the electoral process.

## 🌟 Features & Importance

### 1. Guided Election Journey
*   **What it is:** A step-by-step interactive timeline.
*   **Why it matters:** Most voters feel overwhelmed by the lack of a clear "roadmap." This feature breaks down the process into manageable phases, ensuring no critical step (like registration deadlines or ID requirements) is missed.

### 2. AI-Powered Chat Assistant (Clara)
*   **What it is:** A persona-aware guide powered by **Google Gemini**.
*   **Why it matters:** Traditional FAQs are static and boring. Clara provides real-time, personalized answers based on your current step and user persona (e.g., student vs. working professional), making information retrieval intuitive and conversational.

### 3. Interactive Simulation Mode
*   **What it is:** A scenario-based virtual voting booth.
*   **Why it matters:** "Experiential learning" is the best way to build confidence. By simulating the voting day experience, users can practice their actions in a safe environment, reducing anxiety for first-time voters.

### 4. Persona-Based Personalization
*   **What it is:** Tailored content streams for different user profiles.
*   **Why it matters:** A first-time voter has different needs than a senior citizen. Personalization ensures that the information delivered is always relevant, high-impact, and accessible.

---

## 💻 Tech Stack

*   **Frontend Framework:** [React 19](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Styling:** Vanilla CSS (Modern design system with glassmorphism)
*   **Animations:** [Framer Motion](https://www.framer.com/motion/)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **AI Engine:** [Google Gemini API](https://ai.google.dev/)
*   **Deployment:** [Firebase Hosting](https://firebase.google.com/docs/hosting)

---

## 🚀 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/breeze-sn/prompt2vote.git
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Environment Variables (local development):**

        - Copy the example file and fill in your key (this repo ignores `.env.local`):
            ```bash
            cp .env.local.example .env.local
            # then open .env.local and paste your key
            ```

        - Alternatively, export temporarily when running the dev server (do not commit keys):
            ```bash
            VITE_GEMINI_API_KEY=YOUR_KEY_HERE npm run dev -- --host 0.0.0.0
            ```

        - Quick curl test (replace `YOUR_KEY_HERE` with your key):
            ```bash
            curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent" \
                -H 'Content-Type: application/json' \
                -H 'X-goog-api-key: YOUR_KEY_HERE' \
                -X POST \
                -d '{"contents":[{"parts":[{"text":"Explain how AI works in a few words"}]}]}'
            ```

        Security note: `VITE_` variables are injected into the client bundle by Vite — this is convenient for prototypes but NOT secure for production. For production, host a server-side proxy that holds the key and forwards requests, or use a backend function (Firebase Functions, Cloud Run, etc.).
4.  **Run Development Server:**
    ```bash
    npm run dev
    ```

---

## 🏆 Hackathon
This project was built for **Prompt Wars**, focusing on leveraging Large Language Models (LLMs) to solve real-world accessibility challenges in civic technology.

## 📊 Project Analysis Report

This section is written so the evaluation criteria can be verified directly from the repository and the running app.

### Smart, dynamic assistant
* The assistant responds to greetings and gratitude without unnecessary AI calls.
* It uses preset answers for common election questions and Gemini for the remaining election-specific queries.
* It adapts responses by persona and current journey step.

### Logical decision making based on user context
* The assistant is limited to election-related topics only.
* It follows a different path for presets, local responses, and Gemini responses.
* It uses the current journey step to keep answers relevant.

### Effective use of Google Services
* Gemini powers the AI assistant.
* Firebase Hosting publishes the production build.
* Google services are isolated in a dedicated service module for maintainability.

### Practical and real-world usability
* The landing page, chat, and popups are responsive on desktop, tablet, and phone.
* The app includes quick-start election answers and clickable official election links.
* Important election information is organized into short, understandable sections.

### Clean and maintainable code
* The UI is split into focused React components.
* Shared voter state is managed through `JourneyContext` and `JourneyProvider`.
* Gemini logic lives in `src/services/gemini.ts` instead of being mixed into the UI.
* The repository includes a placeholder env example and documentation for safer setup.

### Challenge vertical and persona alignment
* The project is built for the election vertical.
* The primary personas are first-time voters, students, and working professionals.
* The experience stays centered on eligibility, registration, voter ID, voting day, and election guidance.

### Safety and trust
* Election-only filtering reduces irrelevant answers.
* Preset Q&A reduces dependence on the model for common tasks.
* Hallucination guards and official-source links keep answers grounded.

### Accessibility and device support
* The UI is responsive and usable on smaller screens.
* Controls are simple and visible.
* Key actions are exposed through buttons, menus, and modal panels.

## ✅ Challenge Expectations

Prompt2Vote is designed to align with the challenge criteria in a practical way:

* **Smart, dynamic assistant:** The chat assistant adapts to persona, current step, and question type.
* **Logical decision making based on user context:** Responses are filtered by election domain, preset Q&A, persona context, and step-aware prompts.
* **Effective use of Google Services:** The app uses Google Gemini for generation and Firebase Hosting for deployment.
* **Practical, real-world usability:** It includes guided election steps, quick-start answers, clickable official links, and mobile-friendly UI.
* **Clean and maintainable code:** The UI is split into focused components, shared context keeps journey state centralized, and the AI service is isolated in `src/services/gemini.ts`.

The solution also targets a clear challenge persona: first-time and returning voters who need simple, reliable election guidance without generic AI guesswork.

---

## 📬 Contact

**Simran Nagekar**  
📧 Email: [nagekarsimran@gmail.com](mailto:nagekarsimran@gmail.com)  
🌐 GitHub: [breeze-sn](https://github.com/breeze-sn)
