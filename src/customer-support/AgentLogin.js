import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./AgentLogin.css";

function AgentLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        const auth = getAuth();
        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                navigate("/support");
            })
            .catch(() => setError("Invalid email or password. Please try again."));
    };

    return (
        <div className="login-page">
            <h1 className="title">ALLORA SERVICE HUB</h1>
            <p className="subtitle">AGENT LOGIN PORTAL</p>

            <div className="login-container">
                <h2>Agent Login</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="input-box"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <div className="password-container">
                        <input
                            type={showPassword ? "Hide" : "Show"}
                            placeholder="Password"
                            className="input-box"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <span
                            className="eye-icon"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? "Hide" : "Show"}
                        </span>
                    </div>

                    {error && <p className="error-msg">{error}</p>}

                    <button type="submit" className="login-btn">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AgentLogin;



