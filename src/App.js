import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import logo from "./logo.svg";

// Import your pages
import AdminLogin from "./Admin/Login";
import ForgetPassword from "./Admin/ForgetPassword"; // ← match file name

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<AdminLogin />} />
          <Route path="/forgot-password" element={<ForgetPassword />} />
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
