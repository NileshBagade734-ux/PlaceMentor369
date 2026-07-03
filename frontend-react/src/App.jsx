import Homepage from "./components/HomePage";
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