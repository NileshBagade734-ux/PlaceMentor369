import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './InterviewFeedback.css';

const InterviewFeedback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { chatHistory, questions } = location.state || { chatHistory: [], questions: [] };

  // Dummy feedback data that would normally come from the backend evaluation endpoint
  const score = 8;
  const feedback = {
    overall: "You showed a solid understanding of frontend concepts, particularly with React state management. However, you could improve by providing more concrete examples from past projects when discussing bug fixes.",
    strengths: [
      "Clear explanation of React hooks",
      "Good understanding of responsive design principles",
      "Confident tone and well-structured answers"
    ],
    areasForImprovement: [
      "Use the STAR method (Situation, Task, Action, Result) for behavioral questions",
      "Elaborate more on specific debugging tools you use"
    ]
  };

  if (!chatHistory.length) {
    return (
      <div className="feedback-container">
        <h2>No interview data found.</h2>
        <button className="back-btn" onClick={() => navigate('/jobs/1')}>Back to Job</button>
      </div>
    );
  }

  return (
    <div className="feedback-container">
      <div className="feedback-header">
        <h1>Interview Results</h1>
        <div className="score-circle">
          <svg viewBox="0 0 36 36" className="circular-chart blue">
            <path className="circle-bg"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path className="circle"
              strokeDasharray={`${score * 10}, 100`}
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <text x="18" y="20.35" className="percentage">{score}/10</text>
          </svg>
        </div>
      </div>

      <div className="feedback-body">
        <div className="feedback-section">
          <h2>Overall Feedback</h2>
          <p>{feedback.overall}</p>
        </div>

        <div className="feedback-grid">
          <div className="feedback-card strengths">
            <h3>Strengths</h3>
            <ul>
              {feedback.strengths.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="feedback-card improvements">
            <h3>Areas for Improvement</h3>
            <ul>
              {feedback.areasForImprovement.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="transcript-section">
          <h2>Interview Transcript</h2>
          <div className="transcript-box">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`transcript-msg ${msg.role}`}>
                <strong>{msg.role === 'ai' ? 'Interviewer' : 'You'}:</strong>
                <p>{msg.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="feedback-actions">
        <button className="primary-btn" onClick={() => navigate('/jobs/1')}>Return to Job</button>
      </div>
    </div>
  );
};

export default InterviewFeedback;
