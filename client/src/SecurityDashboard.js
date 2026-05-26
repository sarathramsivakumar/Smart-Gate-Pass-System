import React, { useState, useEffect } from "react";

function SecurityDashboard({ user }) {
  const [qrCodeId, setQrCodeId] = useState("");
  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState("");

  const fetchLogs = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/security/logs");
      const data = await res.json();
      if (data.ok) setLogs(data.logs);
    } catch (err) {
      console.error("Error fetching logs:", err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleScan = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/security/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCodeId }),
      });

      const data = await res.json();
      setMessage(data.message || data.error);
      fetchLogs();
      setQrCodeId("");
    } catch (err) {
      console.error("Scan error:", err);
      setMessage("❌ Server error, try again later");
    }
  };

  return (
    <div style={{ padding: "30px", textAlign: "center" }}>
      <h2>🛡️ Security Dashboard</h2>

      <form onSubmit={handleScan} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter or Scan QR Code ID"
          value={qrCodeId}
          onChange={(e) => setQrCodeId(e.target.value)}
          required
          style={{
            padding: "10px",
            width: "300px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginRight: "10px",
          }}
        />
        <button
          type="submit"
          style={{
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "10px 15px",
            cursor: "pointer",
          }}
        >
          Record Exit
        </button>
      </form>

      {message && (
        <p
          style={{
            backgroundColor: "#e9ffe9",
            color: "green",
            padding: "8px",
            borderRadius: "5px",
            display: "inline-block",
          }}
        >
          {message}
        </p>
      )}

      <h3 style={{ marginTop: "30px" }}>📋 Exit Logs</h3>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "10px",
          textAlign: "left",
        }}
      >
        <thead>
          <tr style={{ background: "#f1f1f1" }}>
            <th>Student</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {logs.length > 0 ? (
            logs.map((log) => (
              <tr key={log._id}>
                <td>{log.studentName}</td>
                <td>{log.date}</td>
                <td>{log.time}</td>
                <td style={{ color: "green", fontWeight: "bold" }}>
                  {log.status}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default SecurityDashboard;
