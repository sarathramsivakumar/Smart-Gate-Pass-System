import React, { useState, useEffect } from "react";
import Login from "./Login";
import GatePassForm from "./GatePassForm";
import GatePassRequests from "./GatePassRequests";
import AdminDashboard from "./AdminDashboard";
import SecurityDashboard from "./SecurityDashboard";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);

  // ✅ Keep user logged in even after refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <div className="app-wrapper">
      {!user ? (
        // ================= Login Page =================
        <Login setUser={setUser} />
      ) : (
        // ================= Dashboard Wrapper =================
        <div className="app-container">
          {/* Header Section */}
          <header className="header">
            <h2>🎓 Class2Gate Smart Pass</h2>
            <div className="user-info">
              <span>
                👤 {user.name} ({user.role.toUpperCase()})
              </span>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </header>

          {/* Dynamic Dashboard Section */}
          <main className="dashboard">
            {user.role === "student" ? (
              <GatePassForm user={user} />
            ) : user.role === "admin" ? (
              <AdminDashboard user={user} />
            ) : user.role === "security" ? (
              <SecurityDashboard user={user} />
            ) : (
              <GatePassRequests user={user} />
            )}
          </main>

          {/* Footer Section */}
          <footer className="footer">
            <p>© {new Date().getFullYear()} Class2Gate | Smart Gate Pass System</p>
          </footer>
        </div>
      )}
    </div>
  );
}

export default App;
