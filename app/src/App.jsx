import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ReviewDocument from "./pages/ReviewDocument";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/documents/:id" element={<ReviewDocument />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;