import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Login from "./pages/Login";
import DiscoverLanding from "./pages/DiscoverLanding";
import CustomerDashboard from "./pages/Customer/CustomerDashboard";
import About from "./pages/About";
import Services from "./pages/Services";
import GetStarted from "./pages/GetStarted";
import Insights from "./pages/Insights";
import SupportDashboard from "./customer-support/Dashboard";
import AdminLogin from "./Admin/Login";
import AdminDashboard from "./Admin/Dashboard";
import ManageUsers from "./Admin/ManageUsers";
import ForgotPassword from "./Admin/ForgetPassword";
import { auth, db } from "./firebase";
import "./App.css";

const RoleProtectedRoute = ({ requiredRole, children }) => {
  const [state, setState] = useState({ checking: true, allowed: false });
  const location = useLocation();
  const allowedRoles = useMemo(
    () => (Array.isArray(requiredRole) ? requiredRole : [requiredRole]),
    [requiredRole]
  );

  useEffect(() => {
    if (!auth || !db) {
      setState({ checking: false, allowed: false });
      return;
    }

    let isActive = true;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!isActive) return;

      if (!currentUser) {
        setState({ checking: false, allowed: false });
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", currentUser.uid));
        const data = snap.exists() ? snap.data() : {};
        const role = data.role || data.Role || data.userType || null;
        setState({ checking: false, allowed: allowedRoles.includes(role) });
      } catch (error) {
        console.warn("[Auth] Failed to read role", error);
        setState({ checking: false, allowed: false });
      }
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [allowedRoles, requiredRole]);

  if (state.checking) {
    return <div style={{ padding: 24, textAlign: "center" }}>Checking access...</div>;
  }

  if (!state.allowed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

const PublicSupportPage = Insights;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<DiscoverLanding />} />
        <Route path="/discover" element={<DiscoverLanding />} />
        <Route path="/login" element={<Login defaultMode="login" />} />
        <Route path="/signup" element={<Login defaultMode="signup" />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/help" element={<PublicSupportPage />} />
        <Route path="/get-started" element={<GetStarted />} />

        {/* Protected routes */}
        <Route
          path="/my-board"
          element={
            <RoleProtectedRoute requiredRole="Customer">
              <CustomerDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route path="/dashboard" element={<Navigate to="/my-board" replace />} />
        <Route
          path="/admin/dashboard"
          element={
            <RoleProtectedRoute requiredRole="Administrator">
              <AdminDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleProtectedRoute requiredRole="Administrator">
              <ManageUsers />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <RoleProtectedRoute requiredRole={["Customer Support", "Customer", "Administrator"]}>
              <SupportDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route path="/agent-dashboard" element={<Navigate to="/support" replace />} />

        {/* Admin auth helpers (public) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
