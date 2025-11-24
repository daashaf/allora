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
import { db, ensureFirebaseAuth, isFirebaseConfigured } from "../firebase";
import { formatSnapshotTimestamp } from "../utils/firestoreHelpers";

export default function ManageUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("All");
  const [status, setStatus] = useState("All");
  const blankForm = { name: "", email: "", role: "Customer", status: "Active" };
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState(blankForm);
  const [viewUser, setViewUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

  const ensureAuth = async () => {
    const user = await ensureFirebaseAuth();
    if (!user) {
      alert(
        "Firebase authentication is not available. Enable anonymous auth or provide service credentials."
      );
      return false;
    }
    return true;
  };

  const openAddModal = () => {
    setFormData(blankForm);
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setFormData(blankForm);
    setSubmitting(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!db || submitting) return;
    if (!(await ensureAuth())) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "Customer"), {
        ...formData,
        joinedAt: serverTimestamp(),
      });
      closeAddModal();
    } catch (error) {
      console.error("[Firebase] Failed to add user", error);
      const message =
        error?.code === "permission-denied"
          ? "Firebase rejected this write (Missing or insufficient permissions). Check Firestore rules or enable anonymous auth."
          : "Unable to add user. Please try again.";
      alert(message);
      setSubmitting(false);
    }
  };

  const toggleUserStatus = async (id) => {
    if (!db) return;
    if (!(await ensureAuth())) return;
    const target = users.find((u) => u.id === id);
    if (!target) return;
    const nextStatus = target.status === "Suspended" ? "Active" : "Suspended";
    try {
      await updateDoc(doc(db, "Customer", id), { status: nextStatus });
    } catch (error) {
      console.error("[Firebase] Failed to update user", id, error);
      const message =
        error?.code === "permission-denied"
          ? "Permission denied. Ensure Firebase allows updates for this user."
          : "Unable to update status. Please try again.";
      alert(message);
    }
  };

  const deleteUser = async (id) => {
    if (!db) return;
    if (!(await ensureAuth())) return;
    if (!window.confirm("Remove this user permanently?")) return;
    try {
      await deleteDoc(doc(db, "Customer", id));
    } catch (error) {
      console.error("[Firebase] Failed to delete user", id, error);
      const message =
        error?.code === "permission-denied"
          ? "Permission denied. Check Firestore rules for delete access."
          : "Unable to delete user. Please try again.";
      alert(message);
    }
  };

  return (
    <div className="main-content users-page">
      <div className="page-header">
        <h1 className="title">Manage Users</h1>
        <div className="header-actions">
          <button className="action-btn" onClick={() => navigate("/admin/dashboard")}>Back to Dashboard</button>
          <button className="action-btn primary" onClick={openAddModal} disabled={!isFirebaseConfigured}>
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
                    <button className="action-btn" onClick={() => setViewUser(u)}>View</button>
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

      {showAddModal && (
        <div className="modal-backdrop" onClick={closeAddModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Add User</h3>
            <form className="modal-form" onSubmit={handleAddUser}>
              <div className="form-field">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Jane Doe"
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="jane@example.com"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="role">Role</label>
                  <select id="role" name="role" value={formData.role} onChange={handleFormChange}>
                    <option value="Customer">Customer</option>
                    <option value="Customer Support">Customer Support</option>
                    <option value="Service Provider">Service Provider</option>
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="status">Status</label>
                  <select id="status" name="status" value={formData.status} onChange={handleFormChange}>
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button className="action-btn" type="button" onClick={closeAddModal} disabled={submitting}>
                  Cancel
                </button>
                <button
                  className="action-btn primary"
                  type="submit"
                  disabled={!formData.name.trim() || !formData.email.trim() || submitting}
                >
                  {submitting ? "Saving..." : "Save User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewUser && (
        <div className="modal-backdrop" onClick={() => setViewUser(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>User Details</h3>
            <div className="view-field">
              <strong>Name:</strong> <span>{viewUser.name}</span>
            </div>
            <div className="view-field">
              <strong>Email:</strong> <span>{viewUser.email}</span>
            </div>
            <div className="view-field">
              <strong>Role:</strong> <span>{viewUser.role}</span>
            </div>
            <div className="view-field">
              <strong>Status:</strong> <span>{viewUser.status}</span>
            </div>
            <div className="view-field">
              <strong>Joined:</strong> <span>{viewUser.joinedAt}</span>
            </div>
            <div className="modal-actions">
              <button className="action-btn" onClick={() => setViewUser(null)}>
                Close
              </button>
              <button className="action-btn primary" onClick={() => setViewUser(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
