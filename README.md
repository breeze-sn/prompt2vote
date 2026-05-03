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

---

## 📬 Contact

**Simran Nagekar**  
📧 Email: [nagekarsimran@gmail.com](mailto:nagekarsimran@gmail.com)  
🌐 GitHub: [breeze-sn](https://github.com/breeze-sn)
