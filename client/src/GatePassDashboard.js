import React, { useState, useEffect } from "react";
import axios from "axios";

function GatePassDashboard({ user }) {
  const [requests, setRequests] = useState([]);
  const [formData, setFormData] = useState({
    reason: "",
    destination: "",
    date: "",
    time: "",
  });

  // 🧩 Student submits gate pass
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/gatepass", {
        ...formData,
        studentId: user._id,
      });
      alert("Gate pass request submitted!");
      setFormData({ reason: "", destination: "", date: "", time: "" });
    } catch (err) {
      console.error(err);
      alert("Error submitting gate pass");
    }
  };

  // 🧩 Advisor/HOD view student requests
  useEffect(() => {
    const fetchRequests = async () => {
      if (user.role !== "student") {
        try {
          const res = await axios.get("http://localhost:5000/api/gatepass");
          setRequests(res.data);
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchRequests();
  }, [user]);

  // 🧩 Approve / Reject actions (for HOD & Advisor)
  const handleDecision = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/gatepass/${id}`, { status });
      setRequests((prev) =>
        prev.map((req) =>
          req._id === id ? { ...req, status } : req
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  // 🧭 Conditional UI
  if (user.role === "student") {
    return (
      <div style={{ margin: "20px" }}>
        <h2>Welcome, {user.name}</h2>
        <h3>Submit Gate Pass Request</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Reason"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            required
          /><br />
          <input
            type="text"
            placeholder="Destination"
            value={formData.destination}
            onChange={(e) =>
              setFormData({ ...formData, destination: e.target.value })
            }
            required
          /><br />
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          /><br />
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
          /><br />
          <button type="submit">Submit</button>
        </form>
      </div>
    );
  }

  // 🧭 For Advisor / HOD
  return (
    <div style={{ margin: "20px" }}>
      <h2>Welcome, {user.name} ({user.role.toUpperCase()})</h2>
      <h3>Student Gate Pass Requests</h3>
      {requests.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        requests.map((req) => (
          <div
            key={req._id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <p><strong>Reason:</strong> {req.reason}</p>
            <p><strong>Destination:</strong> {req.destination}</p>
            <p><strong>Date:</strong> {req.date}</p>
            <p><strong>Time:</strong> {req.time}</p>
            <p><strong>Status:</strong> {req.status}</p>
            {req.status === "Pending" && (
              <>
                <button onClick={() => handleDecision(req._id, "Approved")}>
                  Approve
                </button>
                <button onClick={() => handleDecision(req._id, "Rejected")}>
                  Reject
                </button>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default GatePassDashboard;
