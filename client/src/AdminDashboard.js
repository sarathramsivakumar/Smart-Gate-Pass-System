import React, { useEffect, useState } from "react";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [passes, setPasses] = useState([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [message, setMessage] = useState("");

  // Fetch all users
  const fetchUsers = async () => {
    const res = await fetch("http://localhost:5000/api/admin/users");
    const data = await res.json();
    if (data.ok) setUsers(data.users);
  };

  // Fetch all passes
  const fetchPasses = async () => {
    const res = await fetch("http://localhost:5000/api/admin/gatepasses");
    const data = await res.json();
    if (data.ok) setPasses(data.passes);
  };

  useEffect(() => {
    fetchUsers();
    fetchPasses();
  }, []);

  // Add user
  const handleAddUser = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    if (data.ok) fetchUsers();
  };

  // Delete user
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      const res = await fetch(
        `http://localhost:5000/api/admin/users/${id}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      setMessage(data.message || data.error);
      fetchUsers();
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>🛠 Admin Dashboard</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}

      <h3>👤 Add New User</h3>
      <form onSubmit={handleAddUser} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Name"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          required
        />
        <select
          value={newUser.role}
          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
        >
          <option value="student">Student</option>
          <option value="advisor">Advisor</option>
          <option value="hod">HOD</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          style={{
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            padding: "8px 12px",
            borderRadius: "5px",
            marginLeft: "10px",
          }}
        >
          Add User
        </button>
      </form>

      <h3>📋 All Users</h3>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "30px",
        }}
      >
        <thead>
          <tr style={{ background: "#f1f1f1" }}>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <button
                  onClick={() => handleDelete(u._id)}
                  style={{
                    backgroundColor: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    padding: "5px 10px",
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>🚪 All Gate Pass Requests</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f1f1f1" }}>
            <th>Student</th>
            <th>Date</th>
            <th>Time</th>
            <th>Class Hour</th>
            <th>Reason</th>
            <th>Advisor</th>
            <th>HOD</th>
          </tr>
        </thead>
        <tbody>
          {passes.map((p) => (
            <tr key={p._id}>
              <td>{p.studentName}</td>
              <td>{p.date}</td>
              <td>{p.time}</td>
              <td>{p.classHour}</td>
              <td>{p.reason}</td>
              <td>{p.advisorStatus.toUpperCase()}</td>
              <td>{p.hodStatus.toUpperCase()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;
