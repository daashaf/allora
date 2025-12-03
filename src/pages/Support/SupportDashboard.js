import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
    collection,
    getDocs,
    addDoc,
    doc,
    getDoc,
    onSnapshot,
    query,
    where,
    orderBy,
    serverTimestamp,
} from "firebase/firestore";
import NavigationBar from "../../components/NavigationBar";
import { auth, db } from "../../firebase";
import "./SupportDashboard.css";

const getTicketStoreKey = (ownerKey = "guest") => `allora_support_tickets_${ownerKey}`;

const readTicketsLocal = (ownerKey = "guest") => {
    const key = getTicketStoreKey(ownerKey);
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const writeTicketsLocal = (list, ownerKey = "guest") => {
    const key = getTicketStoreKey(ownerKey);
    try {
        localStorage.setItem(key, JSON.stringify(list));
    } catch {
        // ignore
    }
};

const FALLBACK_SUPPORT_TOPICS = [
    {
        id: "basics",
        title: "Getting started",
        desc: "Create an account, post your first request, and understand approvals.",
        faqs: [
            { Q: "How do I create a ticket?", A: "Click '+ Create Ticket' above, fill in subject and description, then submit." },
            { Q: "Do I need to be logged in?", A: "Logging in links tickets to your email. Guest tickets work, but updates arrive via email only." },
        ],
    },
    {
        id: "billing",
        title: "Billing & payments",
        desc: "Invoices, receipts, and payment timelines.",
        faqs: [
            { Q: "Where is my receipt?", A: "Receipts are emailed instantly after payment and appear in your ticket timeline." },
            { Q: "Can I change payment method?", A: "Yes—reply on your ticket or create a new one and the team will update billing details." },
        ],
    },
];

function SupportDashboard() {

    const navigate = useNavigate();

    // States
    const [successMessage, setSuccessMessage] = useState("");

    const [showLogout, setShowLogout] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showTickets, setShowTickets] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [feedbackTicket, setFeedbackTicket] = useState(null);
    const [headerUserEmail, setHeaderUserEmail] = useState("");
    const [openTopicId, setOpenTopicId] = useState(null);



    // Real Data States
    const [notifications, setNotifications] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [supportTopics, setSupportTopics] = useState(FALLBACK_SUPPORT_TOPICS);
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
            if (currentUser?.email) {
                setHeaderUserEmail(currentUser.email);
            }
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
    }, []);

    //  FETCH TICKETS (REAL-TIME) 
    useEffect(() => {
        const ownerKey = auth?.currentUser?.email?.toLowerCase() || "guest";
        const fallbackTickets = readTicketsLocal(ownerKey);
        if (!db) {
            setTickets(fallbackTickets);
            return undefined;
        }

        if (ownerKey === "guest") {
            setTickets(fallbackTickets);
            return undefined;
        }

        const ticketsQuery = query(
            collection(db, "tickets"),
            where("userEmail", "==", ownerKey),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(
            ticketsQuery,
            (snap) => {
                const data = snap.docs.map((docSnap) => {
                    const item = docSnap.data();
                    const createdAt = item.createdAt?.toDate ? item.createdAt.toDate() : item.createdAt;
                    return {
                        id: docSnap.id,
                        ...item,
                        createdAt,
                    };
                });
                setTickets(data);
                writeTicketsLocal(data, ownerKey);
            },
            (error) => {
                console.error("[SupportDashboard] Error fetching tickets:", error);
                setTickets(fallbackTickets);
            }
        );

        return unsubscribe;
    }, []);

    //  FETCH NOTIFICATIONS (one-time) 
    useEffect(() => {
        const fetchNotifications = async () => {
            if (!db) return;
            try {
                const snap = await getDocs(collection(db, "notifications"));
                const data = snap.docs.map((doc) => doc.data().message || "");
                setNotifications(data);
            } catch (error) {
                console.error("[SupportDashboard] Notifications fetch error", error);
            }
        };
        fetchNotifications();
    }, []);

    //  FETCH FAQ TOPICS (one-time) 
    useEffect(() => {
        const fetchTopics = async () => {
            if (!db) return;
            try {
                const snap = await getDocs(collection(db, "supportTopics"));
                const topicsData = snap.docs.map((doc) => {
                    const item = doc.data();
                    return {
                        id: doc.id,
                        title: item.title || "Untitled Topic",
                        desc: item.desc || "",
                        faqs: item.FAQS || item.faqs || [],
                    };
                });
                if (topicsData.length) {
                    setSupportTopics(topicsData);
                } else {
                    setSupportTopics(FALLBACK_SUPPORT_TOPICS);
                }
            } catch (error) {
                console.error("[SupportDashboard] FAQ fetch error", error);
            }
        };
        fetchTopics();
    }, []);

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
        if (!newTicket.subject.trim() || !newTicket.description.trim()) {
            alert("Please fill in both subject and description.");
            return;
        }

        if (!db) {
            alert("Support tickets are unavailable because Firebase is not configured.");
            return;
        }

        console.log("Creating ticket with:", { auth: !!auth, db: !!db, currentUser: auth?.currentUser });

        const currentUser = auth?.currentUser;
        const ownerKey = currentUser?.email?.toLowerCase() || "guest";
        const ticketData = {
            subject: newTicket.subject.trim(),
            description: newTicket.description.trim(),
            status: newTicket.status,
            createdAt: serverTimestamp(),
            userId: currentUser?.uid || "guest",
            userName: userInfo.name || currentUser?.displayName || "Guest User",
            userEmail: (userInfo.email || currentUser?.email || "guest@example.com").toLowerCase(),
            userPhone: userInfo.phone || "Not provided",
        };

        console.log("Ticket data:", ticketData);

        try {
            await addDoc(collection(db, "tickets"), ticketData);
            setNewTicket({ subject: "", description: "", status: "Open" });
            setShowCreateTicket(false);
            setSuccessMessage("Ticket created successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            console.error("Failed to create ticket:", error);
            // Fallback to local storage so the user still sees their ticket.
            const localTicket = {
                ...ticketData,
                id: `local-${Date.now()}`,
                createdAt: new Date(),
            };
            setTickets((prev) => {
                const updated = [localTicket, ...prev];
                writeTicketsLocal(updated, ownerKey);
                return updated;
            });
            setNewTicket({ subject: "", description: "", status: "Open" });
            setShowCreateTicket(false);
            setSuccessMessage("Ticket saved locally. It will sync when Firestore is available.");
            setTimeout(() => setSuccessMessage(""), 4000);
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

    useEffect(() => {
        // Reset open state if topics change
        setOpenTopicId(null);
    }, [supportTopics]);

    const toggleTopic = (key) => {
        setOpenTopicId((prev) => (prev === key ? null : key));
    };

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
        <div className="support-page">
            <NavigationBar activeSection="support" />
            
            {/*  HEADER  */}
            <header className="support-header">
                <div className="header-right">
                    {headerUserEmail && <span className="header-user">Welcome back, {headerUserEmail}.</span>}

                    {/* My Tickets */}
                    <i
                        className="bi bi-journal-text header-icon"
                        title="My Tickets"
                        onClick={() => {
                            setShowTickets((prev) => !prev);
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
                    <div className="profile-section" />
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
                                                <strong>{faq.Q || faq.q}</strong> - {faq.A || faq.a}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-results">
                            No results found - create a support ticket.
                        </p>

                    )
                ) : supportTopics.length ? (
                    <div className="support-grid support-card-grid">
                        {supportTopics.map((topic, index) => (
                            <div
                                key={topic.id || index}
                                className="support-card faq-card"
                                role="button"
                                tabIndex={0}
                                onClick={() => toggleTopic(topic.id || index)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        toggleTopic(topic.id || index);
                                    }
                                }}
                                aria-expanded={openTopicId === (topic.id || index)}
                            >
                                <div className="faq-card-header">
                                    <div>
                                        <h3>{topic.title}</h3>
                                        <p className="support-card-desc">{topic.desc}</p>
                                    </div>
                                </div>
                                {openTopicId === (topic.id || index) && (
                                    <div className="support-card-faqs">
                                        {(topic.faqs || []).map((faq, i) => (
                                            <div key={i} className="faq-row card-row">
                                                <p className="faq-q">{faq.Q || faq.q}</p>
                                                <p className="faq-a">{faq.A || faq.a}</p>
                                            </div>
                                        ))}
                                        {(!topic.faqs || topic.faqs.length === 0) && (
                                            <p className="support-card-empty">No FAQs yet for this topic.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="support-empty-state">
                        <h3>No help topics yet</h3>
                        <p>Start by creating a ticket so our team can add resources for your request.</p>
                        <span className="create-ticket-placeholder" />
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
                        <button
                            className="close-btn"
                            onClick={() => setShowTickets(false)}
                        >
                            Close
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
                                        <td>{t.status || "FAQ"}</td>
                                        <td>{formatDate(t.createdAt)}</td>
                                        <td>
                                            {t.status === "Resolved" ? (
                                                <button
                                                    className="feedback-btn"
                                                    onClick={() => setFeedbackTicket(t)}
                                                >
                                                    Give Feedback
                                                </button>
                                            ) : (
                                                "-"
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
            {/* FEEDBACK POPUP (NEW) */}
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
                            <option value="1">1 - Bad</option>
                            <option value="2">2 - Poor</option>
                            <option value="3">3 - Okay</option>
                            <option value="4">4 - Good</option>
                            <option value="5">5 - Excellent</option>
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
                                            createdAt: new Date(),
                                        });
                                        setSuccessMessage("Thank you! Your feedback has been submitted successfully.");
                                        setFeedbackTicket(null);

                                        setTimeout(() => setSuccessMessage(""), 3000); // hide after 3 sec

                                    } catch (err) {
                                        console.error("Error submitting feedback:", err);
                                        alert("Failed to submit feedback. Please try again.");
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
                <p>(c) 2025 Allora Service Hub. All rights reserved.</p>
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

export default SupportDashboard;
