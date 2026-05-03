import React from 'react';

interface AboutPageProps {
  onBack: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  return (
    <div className="about-page">
      <header className="about-header">
        <button className="back-btn" onClick={onBack}>
          <span className="material-symbols-rounded">arrow_back</span>
          <span>Back</span>
        </button>
        <div className="about-logo">Prompt2Vote</div>
      </header>

      <main className="about-content">
        <section className="about-section">
          <h1>About the Project</h1>
          <p>
            Prompt2Vote is an AI-powered election assistant designed to make the voting process accessible,
            understandable, and transparent for everyone. Built for the Google Gemini Hackathon, this project
            leverages the power of Generative AI to guide users through the complexities of democratic participation.
          </p>
        </section>

        <section className="about-section">
          <h2>Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <span className="material-symbols-rounded">psychology</span>
              <h3>Persona-Based Guidance</h3>
              <p>Tailored information for students, first-time voters, and working professionals.</p>
            </div>
            <div className="feature-card">
              <span className="material-symbols-rounded">chat_bubble</span>
              <h3>Gemini-Powered Chat</h3>
              <p>Instant, concise answers to your election-related queries using the latest Gemini models.</p>
            </div>
            <div className="feature-card">
              <span className="material-symbols-rounded">checklist</span>
              <h3>Step-by-Step Navigation</h3>
              <p>Clear milestones from eligibility checks to the final vote on election day.</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Technology Stack</h2>
          <ul className="tech-list">
            <li><strong>AI Core:</strong> Google Gemini 1.5 & 2.0 Flash</li>
            <li><strong>Frontend:</strong> React, TypeScript, Vite</li>
            <li><strong>Styling:</strong> Pure CSS (Gemini Design Language)</li>
            <li><strong>Hosting:</strong> Firebase App Hosting</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Project Analysis Fit</h2>
          <div className="features-grid">
            <div className="feature-card">
              <span className="material-symbols-rounded">psychology_alt</span>
              <h3>Dynamic Assistant</h3>
              <p>Preset Q&A, persona context, and step-aware prompts keep answers relevant.</p>
            </div>
            <div className="feature-card">
              <span className="material-symbols-rounded">rule</span>
              <h3>Logical Decisioning</h3>
              <p>Election-only filtering and local responses prevent unrelated or unsafe replies.</p>
            </div>
            <div className="feature-card">
              <span className="material-symbols-rounded">cloud</span>
              <h3>Google Services</h3>
              <p>Gemini powers the assistant and Firebase publishes the deployed experience.</p>
            </div>
          </div>
        </section>

        <section className="about-section developer-section">
          <h2>The Developer</h2>
          <div className="developer-card">
            <div className="dev-avatar">
              <img src="/assets/profile.jpg" alt="Simran Nagekar" />
            </div>
            <div className="dev-info">
              <h3>Simran Nagekar</h3>
              <p>Product Designer</p>
              <div className="dev-links">
                <a href="https://www.simransn.tech" target="_blank" rel="noopener noreferrer" title="Portfolio">
                  <i className="fa-solid fa-globe"></i>
                </a>
                <a href="https://www.linkedin.com/in/simransn/" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                  <i className="fa-brands fa-linkedin"></i>
                </a>
                <a href="https://www.behance.net/simrannagekar" target="_blank" rel="noopener noreferrer" title="Behance">
                  <i className="fa-brands fa-behance"></i>
                </a>
                <a href="https://github.com/breeze-sn" target="_blank" rel="noopener noreferrer" title="GitHub">
                  <i className="fa-brands fa-github"></i>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="about-footer">
        <p>&copy; 2026 Prompt2Vote - Built with ❤️ for the Promptwars</p>
      </footer>
    </div>
  );
};
