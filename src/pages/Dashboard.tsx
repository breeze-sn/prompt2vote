import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, Navigation } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <motion.div 
      className="dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <header className="dashboard-header">
        <h1>Your Election Journey</h1>
        <p>A personalized guide to making your voice heard.</p>
      </header>

      <div className="stats-grid">
        <div className="glass-card stat-card">
          <CheckCircle size={32} className="stat-icon" />
          <div className="stat-info">
            <h4>Registration</h4>
            <p>Verified</p>
          </div>
        </div>
        <div className="glass-card stat-card">
          <BookOpen size={32} className="stat-icon" />
          <div className="stat-info">
            <h4>Next Step</h4>
            <p>Research Candidates</p>
          </div>
        </div>
        <div className="glass-card stat-card accent-card">
          <Navigation size={32} className="stat-icon" />
          <div className="stat-info">
            <h4>Days to Election</h4>
            <p className="large-text">14</p>
          </div>
        </div>
      </div>

      <div className="journey-section">
        <h2>Your Next Actions</h2>
        <div className="timeline">
          <div className="timeline-item completed">
            <div className="timeline-marker"></div>
            <div className="timeline-content glass-card">
              <h3>Voter Registration</h3>
              <p>You have successfully registered to vote.</p>
            </div>
          </div>
          <div className="timeline-item active">
            <div className="timeline-marker"></div>
            <div className="timeline-content glass-card">
              <h3>Ballot Research</h3>
              <p>Review the propositions and candidates on your ballot.</p>
              <button className="action-btn">Start Research</button>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content glass-card disabled">
              <h3>Cast Your Vote</h3>
              <p>Find your polling place or mail your ballot.</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
