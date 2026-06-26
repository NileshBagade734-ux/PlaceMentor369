import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './JobDetailsPage.css';

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Dummy job data for presentation
  const job = {
    id: id || '1',
    title: 'Frontend Developer',
    company: 'Tech Innovators Inc.',
    location: 'Remote',
    description: 'We are looking for a skilled Frontend Developer proficient in React, CSS, and modern web architectures to join our dynamic team and build beautiful user experiences.',
    requirements: [
      'Proficiency in React.js and modern JavaScript (ES6+)',
      'Experience with responsive design and modern CSS',
      'Strong problem-solving skills and attention to detail',
      'Familiarity with RESTful APIs and Git'
    ]
  };

  const handlePracticeInterview = () => {
    navigate(`/interview/${job.id}`);
  };

  return (
    <div className="job-details-container">
      <div className="job-header">
        <h1 className="job-title">{job.title}</h1>
        <h3 className="job-company">{job.company} - {job.location}</h3>
      </div>
      
      <div className="job-body">
        <div className="job-section">
          <h2>Job Description</h2>
          <p>{job.description}</p>
        </div>
        
        <div className="job-section">
          <h2>Requirements</h2>
          <ul>
            {job.requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="job-actions">
        <button className="practice-btn" onClick={handlePracticeInterview}>
          <span className="btn-icon">✨</span> Practice AI Interview
        </button>
      </div>
    </div>
  );
};

export default JobDetailsPage;
