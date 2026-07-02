import Homepage from "./components/HomePage";
import JobDetailsPage from "./components/JobDetailsPage";
import MockInterviewSession from "./components/MockInterviewSession";
import InterviewFeedback from "./components/InterviewFeedback";
import { Routes, Route } from "react-router-dom";
import RecruiterLayout from "./components/layout/RecruiterLayout";
import DashboardOverview from "./pages/recruiter/DashboardOverview";
import PostJob from "./pages/recruiter/PostJob";
import ManageApplicants from "./pages/recruiter/ManageApplicants";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />
        <Route path="/interview/:id" element={<MockInterviewSession />} />
        <Route path="/interview/:id/feedback" element={<InterviewFeedback />} />
        
        {/* Recruiter Routes */}
        <Route path="/recruiter" element={<RecruiterLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="post-job" element={<PostJob />} />
          <Route path="manage-applicants" element={<ManageApplicants />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;