import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";
import logo from "./logo.svg";

// Admin screens (login removed per request)
import AdminDashboard from "./Admin/Dashboard";
import ManageUsers from "./Admin/ManageUsers";
import ManagerApprovals from "./Admin/ManagerApprovals";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Insights from "./pages/Insights";
import About from "./pages/About";
import Services from "./pages/Services";
import GetStarted from "./pages/GetStarted";
import "./App.css";


export default function App() {
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


      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/get-started" element={<GetStarted />} />
      </Routes>
    </BrowserRouter>
  );
}

