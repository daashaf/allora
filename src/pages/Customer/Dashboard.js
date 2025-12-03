import React, { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase";
import NavigationBar from "../../components/NavigationBar";
import "./CustomerDashboard.css";

const UPCOMING_BOOKINGS = [
  {
    service: "Garden Care",
    date: "Jun 18 at 08:00",
    provider: "Prana Gardening",
    status: "Confirmed",
  },
  {
    service: "Web Design Sprint",
    date: "Jun 22 at 10:30",
    provider: "Studio Kismet",
    status: "Reviewing quote",
  },
  {
    service: "Mobile Car Grooming",
    date: "Jun 29 at 17:00",
    provider: "Drive Shine",
    status: "Supplier visiting",
  },
];

const CUSTOMER_JOURNEY_STEPS = [
  {
    title: "Share your job",
    copy: "Add location, timing, and budget (or drop photos). Intake takes under a minute.",
  },
  {
    title: "Review vetted pros",
    copy: "Within an hour we send 3–5 verified providers with pricing, reviews, and availability.",
  },
  {
    title: "Book, track, and pay",
    copy: "Approve milestones, chat in one thread, and pay once work is done—Allora monitors the timeline.",
  },
];

export default function CustomerDashboard() {
  const [userEmail, setUserEmail] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [ticketStats, setTicketStats] = useState({ open: 0, total: 0 });
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketForm, setTicketForm] = useState({ subject: "", message: "", priority: "Medium" });
  const [ticketSubmitting, setTicketSubmitting] = useState(false);

  useEffect(() => {
    if (!auth) return undefined;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setUserEmail(user?.email || "");
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!db) {
      setBookings(UPCOMING_BOOKINGS);
      setBookingsLoading(false);
      return undefined;
    }

    const buildQuery = () => {
      if (currentUser?.uid) {
        return query(collection(db, "Services"), where("userId", "==", currentUser.uid));
      }
      if (currentUser?.email) {
        return query(collection(db, "Services"), where("customerEmail", "==", currentUser.email));
      }
      if (currentUser?.email) {
        return query(collection(db, "Services"), where("email", "==", currentUser.email));
      }
      return null;
    };

    const q = buildQuery();

    if (!q) {
      setBookings(UPCOMING_BOOKINGS);
      setBookingsLoading(false);
      return undefined;
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const mapped = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() || {};
          return {
            id: docSnap.id,
            service: data.service || data.name || "Service",
            date: data.date || data.bookedAt || "",
            provider: data.provider || data.providerName || "Provider",
            status: data.status || "Scheduled",
          };
        });
        setBookings(mapped);
        setBookingsLoading(false);
      },
      (error) => {
        console.warn("[CustomerDashboard] Failed to load services", error);
        setBookings(UPCOMING_BOOKINGS);
        setBookingsLoading(false);
      }
    );

    return unsubscribe;
  }, [currentUser]);

  // Tickets count from Firestore
  useEffect(() => {
    if (!db) return undefined;
    const buildQuery = () => {
      if (currentUser?.uid) {
        return query(collection(db, "tickets"), where("userId", "==", currentUser.uid));
      }
      if (currentUser?.email) {
        return query(collection(db, "tickets"), where("userEmail", "==", currentUser.email));
      }
      return null;
    };
    const q = buildQuery();
    if (!q) return undefined;

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((docSnap) => docSnap.data() || {});
        const total = docs.length;
        const open = docs.filter((t) => {
          const status = (t.status || "").toString().toLowerCase();
          return status && !["resolved", "closed", "completed"].includes(status);
        }).length;
        setTicketStats({ open, total });
      },
      (error) => {
        console.warn("[CustomerDashboard] Failed to load tickets", error);
        setTicketStats({ open: 0, total: 0 });
      }
    );
    return unsubscribe;
  }, [currentUser]);

  const statMetrics = useMemo(() => {
    const totalBookings = bookings.length || UPCOMING_BOOKINGS.length;
    const activeRequests = bookings.filter((b) => {
      const status = (b.status || "").toString().toLowerCase();
      return status && !["completed", "resolved", "cancelled"].includes(status);
    }).length || 0;
    const openTickets = ticketStats.open || 0;
    return [
      { label: "Active requests", value: `${activeRequests}`, detail: "In progress" },
      { label: "Booked services", value: `${totalBookings}`, detail: "Your current bookings" },
      { label: "Support tickets", value: `${openTickets} open`, detail: "Response within 2 hours" },
    ];
  }, [bookings, ticketStats.open]);

  const createTicket = async () => {
    if (!ticketForm.subject.trim() || !ticketForm.message.trim()) {
      alert("Please fill in both subject and message.");
      return;
    }
    
    setTicketSubmitting(true);
    try {
      await addDoc(collection(db, "tickets"), {
        subject: ticketForm.subject.trim(),
        message: ticketForm.message.trim(),
        priority: ticketForm.priority,
        status: "Open",
        userId: currentUser?.uid || "",
        userEmail: currentUser?.email || "",
        customer: currentUser?.email || "Customer",
        createdAt: serverTimestamp(),
      });
      
      setTicketForm({ subject: "", message: "", priority: "Medium" });
      setShowTicketForm(false);
      alert("Support ticket created successfully!");
    } catch (error) {
      console.error("Failed to create ticket:", error);
      alert("Failed to create ticket. Please try again.");
    } finally {
      setTicketSubmitting(false);
    }
  };

  const displayedBookings = bookingsLoading
    ? []
    : bookings.length > 0
    ? bookings
    : UPCOMING_BOOKINGS;

  if (loading) {
    return (
      <div className="customer-page">
        <NavigationBar activeSection="board" />
        <div style={{ padding: "60px", textAlign: "center" }}>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-page">
      <div className="dashboard-page customer-dashboard">
        <div className="dashboard-circle circle-top" aria-hidden="true" />
        <div className="dashboard-circle circle-bottom" aria-hidden="true" />

        <NavigationBar activeSection="board" />

        <main className="customer-dashboard-main">
          <section className="customer-dashboard-greeting">
            <h1>My Board</h1>
            <p>Track quotes, bookings, and support in a calm workspace that keeps every detail together.</p>
            <div className="customer-dashboard-actions">
              <button type="button" className="nav-cta">
                New request
              </button>
              <button type="button" className="ghost" onClick={() => setShowTicketForm(true)}>
                Create Support Ticket
              </button>
            </div>
          </section>

          <section className="customer-dashboard-stats">
            {statMetrics.map((metric) => (
              <article key={metric.label} className="customer-card">
                <p className="customer-card-label">{metric.label}</p>
                <h3>{metric.value}</h3>
                <p>{metric.detail}</p>
              </article>
            ))}
          </section>

          <section className="customer-dashboard-bookings">
            <div className="customer-bookings-header">
              <div>
                <p className="clean-label subtle">Upcoming visits</p>
                <h2>Booked services</h2>
              </div>
              <span className="customer-cta">Manage</span>
            </div>
            <div className="customer-bookings-grid">
              {displayedBookings.map((booking) => (
                <article key={`${booking.service}-${booking.provider}`} className="customer-booking-card">
                  <div>
                    <p className="customer-booking-label">{booking.service}</p>
                    <h3>{booking.date || "Date to be scheduled"}</h3>
                    <p>{booking.provider}</p>
                  </div>
                  <span className={`booking-status status-${booking.status.replace(/\s+/g, "-")}`}>
                    {booking.status}
                  </span>
                </article>
              ))}
            </div>
          </section>

          <section className="clean-steps">
            <div className="clean-section-heading">
              <h2>How Allora works</h2>
              <p>Clear steps from request to completion, with support watching the timeline.</p>
            </div>
            <div className="clean-steps-grid">
              {CUSTOMER_JOURNEY_STEPS.map((step, index) => (
                <article key={step.title}>
                  <span>{`0${index + 1}`}</span>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </article>
              ))}
            </div>
          </section>
        </main>
        
        {showTicketForm && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
            alignItems: "center", justifyContent: "center", zIndex: 1000
          }}>
            <div style={{
              backgroundColor: "white", padding: "24px", borderRadius: "12px",
              width: "90%", maxWidth: "500px", maxHeight: "80vh", overflow: "auto"
            }}>
              <h3>Create Support Ticket</h3>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px" }}>Subject</label>
                <input
                  type="text"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                  placeholder="Brief description of your issue"
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px" }}>Priority</label>
                <select
                  value={ticketForm.priority}
                  onChange={(e) => setTicketForm({...ticketForm, priority: e.target.value})}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px" }}>Message</label>
                <textarea
                  value={ticketForm.message}
                  onChange={(e) => setTicketForm({...ticketForm, message: e.target.value})}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", minHeight: "100px" }}
                  placeholder="Describe your issue in detail"
                />
              </div>
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowTicketForm(false)}
                  style={{ padding: "8px 16px", border: "1px solid #ccc", borderRadius: "4px", backgroundColor: "white" }}
                >
                  Cancel
                </button>
                <button
                  onClick={createTicket}
                  disabled={ticketSubmitting}
                  style={{ padding: "8px 16px", border: "none", borderRadius: "4px", backgroundColor: "#007bff", color: "white" }}
                >
                  {ticketSubmitting ? "Creating..." : "Create Ticket"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}