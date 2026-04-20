import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { userService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [error, setError] = useState("");
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const token = searchParams.get("token");

    if (!token) {
      setError("No token received.");
      setTimeout(() => navigate("/login?error=no_token"), 2000);
      return;
    }

    const run = async () => {
      try {
        // Store token FIRST
        localStorage.setItem("token", token);

        // Small delay to ensure token is stored
        await new Promise((r) => setTimeout(r, 200));

        // Fetch user
        const res = await userService.getUser();
        const userData = res.data;

        console.log("AuthSuccess - user data received:", userData);

        if (!userData || !userData.username) {
          throw new Error("Invalid user data received");
        }

        // Update context
        updateUser(userData);

        // Go to dashboard
        navigate("/dashboard", { replace: true });
      } catch (err) {
        console.error("AuthSuccess error:", err);
        localStorage.removeItem("token");
        setError("Login failed. Please try again.");
        setTimeout(() => navigate("/login?error=server_error"), 2000);
      }
    };

    run();
  }, []);

  if (error) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
        <div className="alert alert-error" style={{ maxWidth: 360 }}>
          <span>❌</span> {error}
        </div>
        <a href="/login" className="btn-secondary">Back to Login</a>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <LoadingSpinner size="lg" text="" />
      <p style={{ color: "var(--text-primary)", fontWeight: 600 }}>Setting up your account...</p>
      <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Fetching GitHub data...</p>
    </div>
  );
};

export default AuthSuccess;