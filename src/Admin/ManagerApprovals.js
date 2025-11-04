import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";

const MOCK_REQUESTS = [
  { id: 101, name: "Harsh Patel", email: "harsh@example.com", submittedAt: "2025-01-03", status: "Pending", notes: "Submitted documents on time" },
  { id: 102, name: "Sana Khan", email: "sana@example.com", submittedAt: "2025-01-04", status: "Pending", notes: "Event portfolio attached" },
  { id: 103, name: "Liam Brown", email: "liam@example.com", submittedAt: "2024-12-28", status: "Approved", notes: "Verified references" },
  { id: 104, name: "Noah Williams", email: "noah@example.com", submittedAt: "2024-12-26", status: "Rejected", notes: "Insufficient documentation" },
];

export default function ManagerApprovals() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Pending");

  const filtered = useMemo(() => {
    return MOCK_REQUESTS.filter((r) => {
      const matchesQuery = `${r.name} ${r.email}`.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "All" || r.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status]);

  const handleApprove = (r) => alert(`Approved ${r.name}`);
  const handleReject = (r) => alert(`Rejected ${r.name}`);
  const handleView = (r) => alert(`Viewing documents for ${r.name}`);

  return (
    <div className="main-content users-page">
      <div className="page-header">
        <h1 className="title">New Manager Approvals</h1>
        <div className="header-actions">
          <button className="action-btn" onClick={() => navigate("/admin/dashboard")}>Back to Dashboard</button>
        </div>
      </div>

      <div className="filters">
        <input
          className="search"
          type="text"
          placeholder="Search applicant name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
          <option>All</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Email</th>
              <th>Submitted</th>
              <th>Notes</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: 16 }}>No requests found.</td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td>{r.submittedAt}</td>
                  <td>{r.notes}</td>
                  <td>
                    <span className={`badge ${r.status.toLowerCase()}`}>{r.status}</span>
                  </td>
                  <td className="table-actions">
                    <button className="action-btn" onClick={() => handleView(r)}>View</button>
                    {r.status === "Pending" && (
                      <>
                        <button className="action-btn primary" onClick={() => handleApprove(r)}>Approve</button>
                        <button className="action-btn danger" onClick={() => handleReject(r)}>Reject</button>
                      </>
                    )}
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

