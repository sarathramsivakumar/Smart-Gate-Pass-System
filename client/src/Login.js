import React, { useState } from "react";

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("🔄 Logging in...");

    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.ok) {
        setUser(data.user);
      } else {
        setMessage("❌ " + data.error);
      }
    } catch {
      setMessage("⚠️ Server not responding");
    }
  };

  return (
    <div
      style={{
        background: "white",
        padding: "40px",
        borderRadius: "15px",
        boxShadow: "0 4px 25px rgba(0,0,0,0.1)",
        width: "350px",
        textAlign: "center",
      }}
    >
      <h2 style={{ color: "#007bff", marginBottom: "20px" }}>
        🔐 Smart Gate Login
      </h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        />
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        />
        <button
          type="submit"
          style={{
            background: "#007bff",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Login
        </button>
      </form>

      {message && <p style={{ marginTop: "15px" }}>{message}</p>}
    </div>
  );
}

export default Login;
