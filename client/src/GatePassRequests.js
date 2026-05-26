import React, { useState, useEffect } from "react";

function GatePassRequests({ user }) {
  const [requests, setRequests] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [message, setMessage] = useState("");

  const fetchRequests = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/gatepass`);
      const data = await res.json();

      if (data.ok) {
        let filtered = [];

        // ✅ Both Advisor & HOD see all relevant requests
        if (user.role === "advisor") {
          filtered = data.requests.filter(
            (r) => r.advisorStatus !== "rejected"
          );
        } else if (user.role === "hod") {
          filtered = data.requests; // HOD sees all requests
        }

        setRequests(filtered);

        // Count pending for badge
        const count = filtered.filter(
          (r) =>
            (user.role === "advisor" && r.advisorStatus === "pending") ||
            (user.role === "hod" && r.hodStatus === "pending")
        ).length;

        setPendingCount(count);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 8000); // auto-refresh every 8s
    return () => clearInterval(interval);
  }, []);

  const handleUpdate = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/gatepass/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: user.role, status }),
      });

      const data = await res.json();
      if (data.ok) {
        setMessage(data.message);
        fetchRequests();
      } else {
        setMessage(data.error);
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error, try again later");
    }
  };

  const colorize = (status) => {
    switch (status) {
      case "approved":
        return "green";
      case "rejected":
        return "red";
      default:
        return "orange";
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>📋 {user.role.toUpperCase()} Dashboard</h2>

      <h3>
        🔔 Pending Requests:{" "}
        <span
          style={{
            backgroundColor: "orange",
            padding: "5px 10px",
            borderRadius: "10px",
            color: "white",
          }}
        >
          {pendingCount}
        </span>
      </h3>

      {message && (
        <p
          style={{
            color: "green",
            backgroundColor: "#e9ffe9",
            padding: "10px",
            borderRadius: "10px",
            width: "fit-content",
          }}
        >
          {message}
        </p>
      )}

      {requests.length === 0 ? (
        <p>No gate pass requests found.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
            textAlign: "left",
          }}
        >
          <thead>
            <tr style={{ background: "#f1f1f1" }}>
              <th>Student</th>
              <th>Date</th>
              <th>Time</th>
              <th>Class Hour</th>
              <th>Reason</th>
              <th>Advisor Status</th>
              <th>HOD Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r._id}>
                <td>{r.studentName}</td>
                <td>{r.date}</td>
                <td>{r.time}</td>
                <td>{r.classHour}</td>
                <td>{r.reason}</td>

                {/* Advisor Status */}
                <td
                  style={{
                    color: colorize(r.advisorStatus),
                    fontWeight: "bold",
                  }}
                >
                  {r.advisorStatus.toUpperCase()}
                </td>

                {/* HOD Status */}
                <td
                  style={{
                    color: colorize(r.hodStatus),
                    fontWeight: "bold",
                  }}
                >
                  {r.hodStatus.toUpperCase()}
                </td>

                <td>
                  {(user.role === "advisor" && r.advisorStatus === "pending") ||
                  (user.role === "hod" && r.hodStatus === "pending") ? (
                    <>
                      <button
                        disabled={
                          user.role === "hod" &&
                          r.advisorStatus !== "approved"
                        }
                        onClick={() => handleUpdate(r._id, "approved")}
                        style={{
                          background:
                            user.role === "hod" &&
                            r.advisorStatus !== "approved"
                              ? "#ccc"
                              : "green",
                          color: "white",
                          border: "none",
                          padding: "5px 10px",
                          marginRight: "10px",
                          borderRadius: "5px",
                          cursor:
                            user.role === "hod" &&
                            r.advisorStatus !== "approved"
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        Approve
                      </button>

                      <button
                        disabled={
                          user.role === "hod" &&
                          r.advisorStatus !== "approved"
                        }
                        onClick={() => handleUpdate(r._id, "rejected")}
                        style={{
                          background:
                            user.role === "hod" &&
                            r.advisorStatus !== "approved"
                              ? "#ccc"
                              : "red",
                          color: "white",
                          border: "none",
                          padding: "5px 10px",
                          borderRadius: "5px",
                          cursor:
                            user.role === "hod" &&
                            r.advisorStatus !== "approved"
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        Reject
                      </button>
                    </>
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

export default GatePassRequests;
