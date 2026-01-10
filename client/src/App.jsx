import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Status from './pages/Status';
import Dashboard from './pages/Dashboard';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname === '/admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 flex items-center justify-center p-4">
      <div className={isAdminRoute ? "w-full flex items-center justify-center" : "w-full max-w-md"}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/:type" element={<Register />} />
          <Route path="/status" element={<Status />} />
          <Route path="/admin" element={<Dashboard />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
