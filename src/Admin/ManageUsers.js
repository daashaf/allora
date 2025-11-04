import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";

const MOCK_USERS = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "Customer", status: "Active", joinedAt: "2024-01-05" },
  { id: 2, name: "Bob Smith", email: "bob.smith@example.com", role: "Customer Support", status: "Active", joinedAt: "2024-02-17" },
  { id: 3, name: "Carlos Diaz", email: "carlos@example.com", role: "Service Provider", status: "Pending", joinedAt: "2024-03-02" },
  { id: 4, name: "Diana Lee", email: "diana@example.com", role: "Customer", status: "Suspended", joinedAt: "2023-12-22" },
  { id: 5, name: "Emily Chen", email: "emily@example.com", role: "Service Provider", status: "Active", joinedAt: "2024-04-11" },
];

export default function ManageUsers() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("All");
  const [status, setStatus] = useState("All");

  const filtered = useMemo(() => {
    return MOCK_USERS.filter((u) => {
      const matchesQuery = `${u.name} ${u.email}`.toLowerCase().includes(query.toLowerCase());
      const matchesRole = role === "All" || u.role === role;
      const matchesStatus = status === "All" || u.status === status;
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [query, role, status]);

  const clearFilters = () => {
    setQuery("");
    setRole("All");
    setStatus("All");
  };

  return (
    <div className="main-content users-page">
      <div className="page-header">
        <h1 className="title">Manage Users</h1>
        <div className="header-actions">
          <button className="action-btn" onClick={() => navigate("/admin/dashboard")}>Back to Dashboard</button>
          <button className="action-btn primary" onClick={() => alert("Add user flow")}>Add User</button>
        </div>
      </div>

      <div className="filters">
        <input
          className="search"
          type="text"
          placeholder="Search name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="select" value={role} onChange={(e) => setRole(e.target.value)}>
          <option>All</option>
          <option>Customer</option>
          <option>Customer Support</option>
          <option>Service Provider</option>
        </select>
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>All</option>
          <option>Active</option>
          <option>Suspended</option>
          <option>Pending</option>
        </select>
        <button className="action-btn" onClick={clearFilters}>Clear</button>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: 16 }}>No users match your filters.</td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <span className={`badge ${u.status.toLowerCase()}`}>{u.status}</span>
                  </td>
                  <td>{u.joinedAt}</td>
                  <td className="table-actions">
                    <button className="action-btn" onClick={() => alert(`Viewing ${u.name}`)}>View</button>
                    <button className="action-btn" onClick={() => alert(`Toggling suspension for ${u.name}`)}>Suspend</button>
                    <button className="action-btn danger" onClick={() => alert(`Deleting ${u.name}`)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

