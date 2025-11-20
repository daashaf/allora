import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Insights from "./pages/Insights";
import About from "./pages/About";
import Services from "./pages/Services";
import GetStarted from "./pages/GetStarted";

// ✅ Use the new landing page you just built
import AlloraLanding from "./pages/AlloraLanding";

import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ Main public dashboard / landing */}
        <Route path="/" element={<AlloraLanding />} />

        {/* Other pages */}
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
