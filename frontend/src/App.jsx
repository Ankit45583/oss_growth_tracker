import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SignInPage from "./pages/SignInPage";
import AuthSuccess from "./pages/AuthSuccess";
import DashboardPage from "./pages/DashboardPage";
import ReposPage from "./pages/ReposPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import "./App.css";

const App = () => (
  <AuthProvider>
    <Router>
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
             <Route path="/signin" element={<SignInPage />} />
            <Route path="/auth/success" element={<AuthSuccess />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/repos" element={<ProtectedRoute><ReposPage /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
            <Route path="*" element={
              <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
                <span style={{ fontSize: 72, fontWeight: 800, color: "var(--text-muted)" }}>404</span>
                <p style={{ color: "var(--text-secondary)" }}>Page not found</p>
                <a href="/" className="btn-secondary">Return home</a>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  </AuthProvider>
);

export default App;