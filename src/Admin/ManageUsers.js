import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase";
import { formatSnapshotTimestamp } from "../utils/firestoreHelpers";

export default function ManageUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("All");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return undefined;
    }
    const unsub = onSnapshot(
      collection(db, "Customer"),
      (snapshot) => {
        const docs = snapshot.docs
          .map((docSnap) => {
            const data = docSnap.data();
            const { display, order } = formatSnapshotTimestamp(
              data.joinedAt,
              data.joinedAt || new Date().toISOString()
            );
            return {
              id: docSnap.id,
              name: data.name || "Unnamed",
              email: data.email || "",
              role: data.role || "Customer",
              status: data.status || "Active",
              joinedAtDisplay: display,
              _order: order,
            };
          })
          .sort((a, b) => b._order - a._order)
          .map(({ _order, joinedAtDisplay, ...rest }) => ({
            ...rest,
            joinedAt: joinedAtDisplay,
          }));
        setUsers(docs);
        setLoading(false);
      },
      (error) => {
        console.error("[Firebase] Failed to load users", error);
        alert("Unable to load users from Firebase.");
        setLoading(false);
      }
    );
    return () => unsub();
  }, [db]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesQuery = `${u.name} ${u.email}`.toLowerCase().includes(query.toLowerCase());
      const matchesRole = role === "All" || u.role === role;
      const matchesStatus = status === "All" || u.status === status;
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [query, role, status, users]);

  const clearFilters = () => {
    setQuery("");
    setRole("All");
    setStatus("All");
  };

  const addUser = async () => {
    if (!db) return;
    const name = window.prompt("User name?");
    if (!name) return;
    const email = window.prompt("Email?");
    if (!email) return;
    const roleValue = window.prompt("Role? (Customer, Customer Support, Service Provider)", "Customer");
    if (!roleValue) return;
    try {
      await addDoc(collection(db, "Customer"), {
        name,
        email,
        role: roleValue,
        status: "Active",
        joinedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("[Firebase] Failed to add user", error);
      alert("Unable to add user. Please try again.");
    }
  };

  const toggleUserStatus = async (id) => {
    if (!db) return;
    const target = users.find((u) => u.id === id);
    if (!target) return;
    const nextStatus = target.status === "Suspended" ? "Active" : "Suspended";
    try {
      await updateDoc(doc(db, "Customer", id), { status: nextStatus });
    } catch (error) {
      console.error("[Firebase] Failed to update user", id, error);
      alert("Unable to update status. Please try again.");
    }
  };

  const deleteUser = async (id) => {
    if (!db) return;
    if (!window.confirm("Remove this user permanently?")) return;
    try {
      await deleteDoc(doc(db, "Customer", id));
    } catch (error) {
      console.error("[Firebase] Failed to delete user", id, error);
      alert("Unable to delete user. Please try again.");
    }
  };

  return (
    <div className="main-content users-page">
      <div className="page-header">
        <h1 className="title">Manage Users</h1>
        <div className="header-actions">
          <button className="action-btn" onClick={() => navigate("/admin/dashboard")}>Back to Dashboard</button>
          <button className="action-btn primary" onClick={addUser} disabled={!isFirebaseConfigured}>
            Add User
          </button>
        </div>
      </div>

      {!isFirebaseConfigured && (
        <div className="alert warning" style={{ marginBottom: 16 }}>
          Firebase keys are missing. Add them to <code>.env</code> to enable user management.
        </div>
      )}

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
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: 16 }}>Loading users...</td>
              </tr>
            ) : filtered.length === 0 ? (
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
                    <button className="action-btn" onClick={() => toggleUserStatus(u.id)}>
                      {u.status === "Suspended" ? "Activate" : "Suspend"}
                    </button>
                    <button className="action-btn danger" onClick={() => deleteUser(u.id)}>Delete</button>
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
