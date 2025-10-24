import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      
      const API_BASE_URL = import.meta.env.VITE_API_URL;

      const res = await axios.post(`${API_BASE_URL}/admin/login`, {
        email,
        password
      });

      localStorage.setItem("adminToken", res.data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginCard}>
        <div style={styles.logoSection}>
          <div style={styles.logo}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <h2 style={styles.title}>Admin Portal</h2>
          <p style={styles.subtitle}>Sign in to access the dashboard</p>
        </div>
        
        {error && (
          <div style={styles.errorAlert}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.errorIcon}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              disabled={isLoading}
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              disabled={isLoading}
            />
          </div>
          
          <button 
            type="submit" 
            style={isLoading ? {...styles.button, ...styles.buttonLoading} : styles.button}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div style={styles.spinner}></div>
                Signing in...
              </>
            ) : "Sign in"}
          </button>
        </form>
        
        <div style={styles.footer}>
          <p style={styles.footerText}>Secure admin access only</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f8fafc 0%, #fef2f2 100%)",
    padding: "20px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif"
  },
  loginCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05), 0 5px 10px rgba(0, 0, 0, 0.05)",
    padding: "40px",
    width: "100%",
    maxWidth: "400px",
  },
  logoSection: {
    textAlign: "center",
    marginBottom: "30px"
  },
  logo: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "60px",
    height: "60px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #8B4513 0%, #A0522D 100%)",
    color: "white",
    marginBottom: "16px",
    boxShadow: "0 4px 6px rgba(139, 69, 19, 0.2)"
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 8px 0"
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0
  },
  errorAlert: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
    border: "1px solid #fecaca"
  },
  errorIcon: {
    marginRight: "8px",
    flexShrink: 0
  },
  form: {
    marginBottom: "30px"
  },
  inputGroup: {
    marginBottom: "20px"
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "8px"
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "16px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    boxSizing: "border-box",
    transition: "all 0.2s ease",
  },
  button: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "16px",
    fontWeight: "600",
    background: "linear-gradient(135deg, #8B4513 0%, #A0522D 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 4px 6px rgba(139, 69, 19, 0.2)"
  },
  buttonLoading: {
    opacity: 0.8,
    cursor: "not-allowed"
  },
  spinner: {
    width: "20px",
    height: "20px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderRadius: "50%",
    borderTopColor: "white",
    animation: "spin 1s linear infinite",
    marginRight: "8px"
  },
  footer: {
    textAlign: "center",
    paddingTop: "20px",
    borderTop: "1px solid #e5e7eb"
  },
  footerText: {
    fontSize: "12px",
    color: "#6b7280",
    margin: 0
  }
};