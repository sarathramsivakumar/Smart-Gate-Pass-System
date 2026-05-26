import React, { useState, useEffect } from "react";

function GatePassForm({ user }) {
  const [reason, setReason] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [classHour, setClassHour] = useState("");
  const [message, setMessage] = useState("");
  const [requests, setRequests] = useState([]);

  // Fetch student's previous requests
  const fetchRequests = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/gatepass");
      const data = await res.json();
      if (data.ok) {
        const myReqs = data.requests.filter(
          (r) => r.studentName === user.name
        );
        setRequests(myReqs);
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason || !date || !time || !classHour) {
      setMessage("⚠️ Please fill all fields!");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/gatepass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: user.name,
          reason,
          date,
          time,
          classHour,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setMessage("✅ Gate pass submitted successfully!");
        setReason("");
        setDate("");
        setTime("");
        setClassHour("");
        fetchRequests();
      } else {
        setMessage("❌ " + data.error);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Server error, please try again");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const fetchQRCode = async (studentName) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/gatepass/qrcode/${encodeURIComponent(
          studentName
        )}`
      );
      const data = await res.json();
      if (data.ok) return data.qrCode;
      else return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  return (
    <div
      style={{
        background: "white",
        padding: "25px",
        borderRadius: "15px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        maxWidth: "850px",
        margin: "auto",
      }}
    >
      <h2>🎓 Welcome, {user.name}</h2>
      <h3>Submit New Gate Pass Request</h3>

      <form onSubmit={handleSubmit}>
        <label>Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <label>Time:</label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <label>Class Hour:</label>
        <input
          type="text"
          placeholder="Enter class hour (e.g., 3rd period)"
          value={classHour}
          onChange={(e) => setClassHour(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <label>Reason:</label>
        <input
          type="text"
          placeholder="Reason for leaving"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
        />

        <button
          type="submit"
          style={{
            backgroundColor: "#007bff",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Submit
        </button>
      </form>

      {message && <p style={{ marginTop: "15px" }}>{message}</p>}

      <hr style={{ margin: "20px 0" }} />

      <h3>📋 Your Previous Requests</h3>
      {requests.length === 0 ? (
        <p>No previous gate pass requests.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
          }}
        >
          <thead>
            <tr style={{ background: "#f1f1f1" }}>
              <th>Date</th>
              <th>Time</th>
              <th>Class Hour</th>
              <th>Reason</th>
              <th>Advisor</th>
              <th>HOD</th>
              <th>QR Code</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r._id}>
                <td>{formatDate(r.date)}</td>
                <td>{r.time}</td>
                <td>{r.classHour}</td>
                <td>{r.reason}</td>
                <td
                  style={{
                    color:
                      (r.advisorStatus || "pending") === "approved"
                        ? "green"
                        : (r.advisorStatus || "pending") === "rejected"
                        ? "red"
                        : "orange",
                  }}
                >
                  {(r.advisorStatus || "pending").toUpperCase()}
                </td>
                <td
                  style={{
                    color:
                      (r.hodStatus || "pending") === "approved"
                        ? "green"
                        : (r.hodStatus || "pending") === "rejected"
                        ? "red"
                        : "orange",
                  }}
                >
                  {(r.hodStatus || "pending").toUpperCase()}
                </td>
                <td>
                  {r.hodStatus === "approved" ? (
                    <button
                      onClick={async () => {
                        setMessage("🔄 Generating QR Code...");
                        const qr = await fetchQRCode(r.studentName);
                        if (qr) {
                          const win = window.open();
                          win.document.write(
                            `<img src="${qr}" alt="QR Code" width="300"/>`
                          );
                        } else {
                          alert("❌ QR not available yet.");
                        }
                        setMessage("");
                      }}
                      style={{
                        background: "#28a745",
                        color: "white",
                        border: "none",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      View QR
                    </button>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default GatePassForm;
