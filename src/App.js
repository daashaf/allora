import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import logo from "./logo.svg";

// Import your pages
import AdminLogin from "./Admin/Login";
import ForgetPassword from "./Admin/ForgetPassword"; // ← match file name

/* ✅ Added import for Admin Dashboard */
import AdminDashboard from "./Admin/Dashboard";
import ManageUsers from "./Admin/ManageUsers";
import ManagerApprovals from "./Admin/ManagerApprovals";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<AdminLogin />} />
          <Route path="/forgot-password" element={<ForgetPassword />} />

          {/* ✅ Added route for Admin Dashboard */}
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
