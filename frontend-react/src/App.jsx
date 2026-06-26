import Homepage from "./components/HomePage";
import JobDetailsPage from "./components/JobDetailsPage";
import MockInterviewSession from "./components/MockInterviewSession";
import InterviewFeedback from "./components/InterviewFeedback";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />
        <Route path="/interview/:id" element={<MockInterviewSession />} />
        <Route path="/interview/:id/feedback" element={<InterviewFeedback />} />
      </Routes>
    </div>
  );
}

export default App;