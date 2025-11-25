import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import {
    getFirestore,
    collection,
    getDocs,
    onSnapshot,
    addDoc,
    doc,
    getDoc,
    serverTimestamp,
} from "firebase/firestore";
import { app } from "../firebase";
import "./Dashboard.css";

function Dashboard() {

    const navigate = useNavigate();
    const auth = getAuth(app);
    const db = getFirestore(app);

    // States
    const [successMessage, setSuccessMessage] = useState("");

    const [showLogout, setShowLogout] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showTickets, setShowTickets] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTopic, setActiveTopic] = useState(null);
    const [openFaq, setOpenFaq] = useState(null);

    const [feedbackTicket, setFeedbackTicket] = useState(null);




    // Real Data States
    const [notifications, setNotifications] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [supportTopics, setSupportTopics] = useState([]);
    const [userInfo, setUserInfo] = useState({ name: "", email: "", phone: "" });

    // New ticket form
    const [newTicket, setNewTicket] = useState({
        subject: "",
        description: "",
        status: "Open",
    });
    const [showCreateTicket, setShowCreateTicket] = useState(false);

    //  FETCH LOGGED-IN USER INFO 
    useEffect(() => {
        const fetchUserData = async () => {
            const currentUser = auth.currentUser;
            if (!currentUser) return;

            try {
                const userRef = doc(db, "users", currentUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    setUserInfo(userSnap.data());
                } else {
                    // fallback: search by email if UID doc not found
                    const allUsers = await getDocs(collection(db, "users"));
                    allUsers.forEach((u) => {
                        const data = u.data();
                        if (data.email === currentUser.email) {
                            setUserInfo(data);
                        }
                    });
                }
            } catch (error) {
                console.error("Error fetching user info:", error);
            }
        };

        fetchUserData();
    }, [auth, db]);

    //  FETCH TICKETS (REAL-TIME) 
    useEffect(() => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const unsub = onSnapshot(collection(db, "tickets"), (snapshot) => {
            const data = snapshot.docs
                .map((doc) => ({ id: doc.id, ...doc.data() }))
                .filter((t) => t.userEmail === currentUser.email);
            setTickets(data);
        });
        return () => unsub();
    }, [db, auth]);

    //  FETCH NOTIFICATIONS (REAL-TIME) 
    useEffect(() => {
        const unsub = onSnapshot(collection(db, "notifications"), (snapshot) => {
            const data = snapshot.docs.map((doc) => doc.data().message || "");
            setNotifications(data);
        });
        return () => unsub();
    }, [db]);

    //  FETCH FAQ TOPICS (REAL-TIME) 
    useEffect(() => {
        const unsub = onSnapshot(collection(db, "supportTopics"), (snapshot) => {
            const topicsData = snapshot.docs.map((doc) => {
                const item = doc.data();
                return {
                    id: doc.id,
                    title: item.title || "Untitled Topic",
                    desc: item.desc || "",
                    faqs: item.FAQS || item.faqs || [],
                };
            });
            setSupportTopics(topicsData);
        });

        return () => unsub();
    }, [db]);

    //  LOGOUT 
    const handleLogout = () => {
        signOut(auth)
            .then(() => navigate("/"))
            .catch((error) => console.error("Logout error:", error));
    };

    //  CLEAR NOTIFICATIONS 
    const clearNotifications = () => setNotifications([]);

    //  CREATE NEW TICKET (AUTO USER INFO + SERVER TIME) 
    const handleCreateTicket = async (e) => {
        e.preventDefault();
        if (!newTicket.subject.trim() || !newTicket.description.trim()) return;
        try {
            const currentUser = auth.currentUser;
            await addDoc(collection(db, "tickets"), {
                subject: newTicket.subject,
                description: newTicket.description,
                status: newTicket.status,
                createdAt: serverTimestamp(), //  exact Firestore server time
                // Auto capture user details
                userId: currentUser?.uid || null,
                userName: userInfo.name || "Unknown User",
                userEmail: userInfo.email || currentUser?.email || "No Email",
                userPhone: userInfo.phone || "Not provided",
            });
            setNewTicket({ subject: "", description: "", status: "Open" });
            setShowCreateTicket(false);
        } catch (error) {
            console.error("Error creating ticket:", error);
        }
    };

    // SAFE SEARCH FILTER 
    const filteredResults = (supportTopics || [])
        .map((topic) => ({
            ...topic,
            faqs: (topic?.faqs || []).filter((faq) => {
                const q = faq?.Q?.toLowerCase?.() || faq?.q?.toLowerCase?.() || "";
                const a = faq?.A?.toLowerCase?.() || faq?.a?.toLowerCase?.() || "";
                const query = searchQuery?.toLowerCase?.() || "";
                return q.includes(query) || a.includes(query);
            }),
        }))
        .filter((topic) => {
            const title = topic?.title?.toLowerCase?.() || "";
            const query = searchQuery?.toLowerCase?.() || "";
            return title.includes(query) || topic.faqs.length > 0;
        });

    //  FORMAT DATE FUNCTION 
    const formatDate = (timestamp) => {
        if (!timestamp) return "Pending...";
        try {
            const date = timestamp.toDate ? timestamp.toDate() : timestamp;
            return date.toLocaleString("en-NZ", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
        } catch {
            return "Invalid date";
        }
    };


    return (
        <div className="dashboard-page">
            {/*  HEADER  */}
            <header className="dashboard-header">
                <h2 className="dashboard-title">Customer Support Dashboard</h2>

                <div className="header-right">
                    {/* My Tickets */}
                    <i
                        className="bi bi-journal-text header-icon"
                        title="My Tickets"
                        onClick={() => {
                            setShowTickets(true);
                            setShowNotifications(false);
                            setShowLogout(false);
                        }}
                    ></i>

                    {/* Notifications */}
                    <div className="icon-wrapper">
                        <i
                            className="bi bi-bell header-icon"
                            title="Notifications"
                            onClick={() => {
                                setShowNotifications(!showNotifications);
                                setShowTickets(false);
                                setShowLogout(false);
                            }}
                        ></i>
                        {notifications.length > 0 && (
                            <span className="notification-badge">{notifications.length}</span>
                        )}

                        {showNotifications && (
                            <div
                                className="notification-dropdown"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="dropdown-header">
                                    Notifications
                                    <button className="clear-btn" onClick={clearNotifications}>
                                        Clear
                                    </button>
                                </div>
                                <ul>
                                    {notifications.length ? (
                                        notifications.map((n, i) => <li key={i}>{n}</li>)
                                    ) : (
                                        <p className="no-notifications">No new notifications</p>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Profile */}
                    <div
                        className="profile-section"
                        onClick={() => {
                            setShowLogout(!showLogout);
                            setShowNotifications(false);
                            setShowTickets(false);
                        }}
                    >
                        <img
                            src="https://via.placeholder.com/40"
                            alt="User"
                            className="profile-photo"
                        />
                        <i className="bi bi-caret-down-fill dropdown-arrow"></i>

                        {showLogout && (
                            <div className="logout-dropdown">
                                <button className="logout-btn" onClick={handleLogout}>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/*SEARCH BAR */}
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search for help topics or questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
            </div>

            {/*  MAIN CONTENT  */}
            <main className="support-main text-center">
                {searchQuery ? (
                    filteredResults.length > 0 ? (
                        <div className="support-grid">
                            {filteredResults.map((topic, index) => (
                                <div key={index} className="support-card active">
                                    <h3>{topic.title}</h3>
                                    {topic.faqs.map((faq, i) => (
                                        <div key={i} className="faq-item search-result">
                                            <p>
                                                <strong>{faq.Q || faq.q}</strong> — {faq.A || faq.a}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-results">
                            No results found —{" "}
                            <button
                                className="create-ticket-link"
                                onClick={() => {
                                    setShowTickets(true);
                                    setShowCreateTicket(true);
                                }}
                            >
                                create a support ticket
                            </button>
                            .
                        </p>

                    )
                ) : (
                    <div className="support-grid">
                        {supportTopics.map((topic, index) => (
                            <div
                                key={index}
                                className={`support-card ${activeTopic === index ? "active" : ""}`}
                                onClick={() => setActiveTopic(activeTopic === index ? null : index)}
                            >
                                <h3>{topic.title}</h3>
                                <p>{topic.desc}</p>

                                {activeTopic === index && (
                                    <div className="faq-section">
                                        {(topic.faqs || []).map((faq, i) => (
                                            <div key={i} className="faq-item">
                                                <div
                                                    className="faq-question"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenFaq(openFaq === i ? null : i);
                                                    }}
                                                >
                                                    <span>{faq.Q || faq.q}</span>
                                                    <i
                                                        className={`bi ${openFaq === i ? "bi-chevron-up" : "bi-chevron-down"
                                                            }`}
                                                    ></i>
                                                </div>
                                                <div className={`faq-answer ${openFaq === i ? "show" : ""}`}>
                                                    <p>{faq.A || faq.a}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/*  TICKETS PANEL  */}
            <div className={`tickets-panel ${showTickets ? "open" : ""}`}>
                <div className="tickets-header">
                    <h4>My Tickets</h4>
                    <div>
                        <button
                            className="add-btn"
                            onClick={() => setShowCreateTicket(!showCreateTicket)}
                        >
                            + Create
                        </button>
                        <button className="close-btn" onClick={() => setShowTickets(false)}>
                            ✕
                        </button>
                    </div>
                </div>

                <div className="tickets-body">
                    {tickets.length > 0 ? (
                        <table className="tickets-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Subject</th>
                                    <th>Status</th>
                                    <th>Created At</th>
                                    <th>Feedback</th>

                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map((t) => (
                                    <tr key={t.id}>
                                        <td>{t.userName || "Not Provided"}</td>
                                        <td>{t.userEmail || "Not Provided"}</td>
                                        <td>{t.userPhone || "Not Provided"}</td>
                                        <td>{t.subject}</td>
                                        <td>{t.status}</td>
                                        <td>{formatDate(t.createdAt)}</td>

                                        <td>   {/*  NEW */}
                                            {t.status === "Resolved" ? (
                                                <button
                                                    className="feedback-btn"
                                                    onClick={() => setFeedbackTicket(t)}
                                                >
                                                    Give Feedback
                                                </button>
                                            ) : (
                                                "—"
                                            )}
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No tickets found.</p>
                    )}
                </div>

                {showCreateTicket && (
                    <div className="create-ticket-form">
                        <h5>Create New Ticket</h5>
                        <form onSubmit={handleCreateTicket}>
                            <input
                                type="text"
                                placeholder="Enter ticket subject..."
                                value={newTicket.subject}
                                onChange={(e) =>
                                    setNewTicket({ ...newTicket, subject: e.target.value })
                                }
                                className="input-box"
                                required
                            />
                            <textarea
                                placeholder="Enter ticket description..."
                                value={newTicket.description}
                                onChange={(e) =>
                                    setNewTicket({ ...newTicket, description: e.target.value })
                                }
                                className="input-box"
                                rows={3}
                                required
                            ></textarea>
                            <button type="submit" className="create-btn">
                                Submit
                            </button>
                        </form>
                    </div>
                )}
            </div>
            {/* ⭐ FEEDBACK POPUP (NEW) */}
            {feedbackTicket && (
                <div className="feedback-popup">
                    <div className="feedback-box">
                        <h3>Feedback for: {feedbackTicket.subject}</h3>

                        <label>Your Rating:</label>
                        <select
                            className="input-box"
                            value={feedbackTicket.rating || ""}
                            onChange={(e) =>
                                setFeedbackTicket({ ...feedbackTicket, rating: e.target.value })
                            }
                        >
                            <option value="">Select rating</option>
                            <option value="1">⭐ 1 - Bad</option>
                            <option value="2">⭐ 2 - Poor</option>
                            <option value="3">⭐ 3 - Okay</option>
                            <option value="4">⭐ 4 - Good</option>
                            <option value="5">⭐ 5 - Excellent</option>
                        </select>

                        <label>Your Feedback:</label>
                        <textarea
                            className="input-box"
                            rows={3}
                            placeholder="Write your feedback..."
                            value={feedbackTicket.feedback || ""}
                            onChange={(e) =>
                                setFeedbackTicket({ ...feedbackTicket, feedback: e.target.value })
                            }
                        ></textarea>

                        <div className="popup-buttons">
                            <button
                                className="submit-btn"
                                onClick={async () => {
                                    try {
                                        await addDoc(collection(db, "feedback"), {
                                            ticketId: feedbackTicket.id,
                                            subject: feedbackTicket.subject,
                                            rating: feedbackTicket.rating || "",
                                            feedback: feedbackTicket.feedback || "",
                                            userEmail: feedbackTicket.userEmail,
                                            userName: feedbackTicket.userName,
                                            createdAt: serverTimestamp(),
                                        });
                                        setSuccessMessage("Thank you! Your feedback has been submitted successfully.");
                                        setFeedbackTicket(null);

                                        setTimeout(() => setSuccessMessage(""), 3000); // hide after 3 sec

                                    } catch (err) {
                                        console.error("Error submitting feedback:", err);
                                    }
                                }}

                            >
                                Submit
                            </button>

                            <button
                                className="cancel-btn"
                                onClick={() => setFeedbackTicket(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {successMessage && (
                <div className="success-toast">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>{successMessage}</span>
                </div>
            )}

            {/*  FOOTER  */}
            <footer className="support-footer">
                <p>© 2025 Allora Service Hub. All rights reserved.</p>
                <div className="footer-social">
                    <p>To know more about our website, visit us on:</p>
                    <div className="social-icons">
                        <a href="https://www.facebook.com" target="_blank" rel="noreferrer">
                            <i className="bi bi-facebook"></i>
                        </a>
                        <a
                            href="https://www.instagram.com"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <i className="bi bi-instagram"></i>
                        </a>
                        <a href="https://www.tiktok.com" target="_blank" rel="noreferrer">
                            <i className="bi bi-tiktok"></i>
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Dashboard;
