import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Invoice from "./Invoice";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Define your routes here */}
        <Route path="/" element={<Login />} />
        <Route path="/invoice" element={<Invoice />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
};

export default App;

