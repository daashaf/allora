import React, { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
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
              <button type="button" className="ghost">
                View timeline
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
      </div>
    </div>
  );
}
