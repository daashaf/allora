import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import logo from "./logo.svg";

// Admin screens (login removed per request)
import AdminDashboard from "./Admin/Dashboard";
import ManageUsers from "./Admin/ManageUsers";
import ManagerApprovals from "./Admin/ManagerApprovals";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* Default to dashboard; no login route */}
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/manager-approvals" element={<ManagerApprovals />} />
        </Routes>

        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    </BrowserRouter>
  );
}

export default App;

