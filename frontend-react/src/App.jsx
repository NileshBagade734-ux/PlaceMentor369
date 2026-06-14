import Homepage from "./components/HomePage";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <div>
     
      <Routes>
      <Route path="/" element={<Homepage />} />
      {/* <Route path="/" element={<Home />} /> */}
    </Routes>
    </div>
    
  );
}

export default App;