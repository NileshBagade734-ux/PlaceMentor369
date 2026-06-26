import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './MockInterviewSession.css';

const MockInterviewSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const chatEndRef = useRef(null);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Simulate fetching questions from backend
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsGenerating(true);
      // In a real app, this would be a POST to /api/interview/generate-questions
      // with studentId and jobId
      setTimeout(() => {
        const dummyQuestions = [
          "Could you explain your experience with React and state management?",
          "How do you handle responsive design and cross-browser compatibility?",
          "Can you walk me through a complex bug you recently solved in a frontend application?"
        ];
        setQuestions(dummyQuestions);
        setChatHistory([
          { role: 'ai', text: "Hello! I'm your AI interviewer. Let's get started. " + dummyQuestions[0] }
        ]);
        setIsGenerating(false);
      }, 2000); // simulate network latency
    };
    fetchQuestions();
  }, [id]);

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newHistory = [...chatHistory, { role: 'user', text: userInput }];
    setChatHistory(newHistory);
    setUserInput('');

    const nextIndex = currentQuestionIndex + 1;
    
    if (nextIndex < questions.length) {
      // Simulate small delay before next question
      setTimeout(() => {
        setChatHistory(prev => [
          ...prev, 
          { role: 'ai', text: "Great. Next question: " + questions[nextIndex] }
        ]);
        setCurrentQuestionIndex(nextIndex);
      }, 1000);
    } else {
      // Finished all questions
      setIsEvaluating(true);
      
      // Simulate sending to backend: POST /api/interview/evaluate
      setTimeout(() => {
        setIsEvaluating(false);
        // Navigate to feedback page, passing the chat history
        navigate(`/interview/${id}/feedback`, { state: { chatHistory: newHistory, questions } });
      }, 3000);
    }
  };

  return (
    <div className="mock-interview-container">
      <div className="interview-header">
        <h2>AI Mock Interview</h2>
        {questions.length > 0 && (
          <div className="progress-indicator">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        )}
      </div>

      <div className="chat-window">
        {isGenerating ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Analyzing resume and generating tailored questions...</p>
          </div>
        ) : (
          <div className="messages-container">
            {chatHistory.map((msg, index) => (
              <div key={index} className={`message-wrapper ${msg.role}`}>
                <div className={`message-bubble ${msg.role}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isEvaluating && (
              <div className="message-wrapper ai">
                <div className="message-bubble ai loading">
                  <div className="typing-dots">
                    <span>.</span><span>.</span><span>.</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {!isGenerating && !isEvaluating && (
        <form className="input-area" onSubmit={handleSubmitAnswer}>
          <textarea
            className="answer-input"
            placeholder="Type your answer here..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmitAnswer(e);
              }
            }}
          />
          <button type="submit" className="send-btn" disabled={!userInput.trim()}>
            Send
          </button>
        </form>
      )}
    </div>
  );
};

export default MockInterviewSession;
