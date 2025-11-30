const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
});
const authAdmin = admin.auth();
const firestore = admin.firestore();

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  })
);
app.use(express.json());

// Simple in-memory store for demo purposes.
const pendingResets = new Map();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT || 587),
  secure: process.env.MAIL_SECURE === "true",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.warn(
      "[mail] Transport verification failed. Check your SMTP settings before going live.",
      error.message
    );
  } else {
    console.log("[mail] Ready to send messages.");
  }
});

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getExpiryDate() {
  const minutes = Number(process.env.RESET_CODE_EXPIRY_MINUTES) || 10;
  return new Date(Date.now() + minutes * 60 * 1000);
}

async function sendMailWithTimeout(options, timeoutMs = 8000) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("MAIL_TIMEOUT")), timeoutMs)
  );
  return Promise.race([transporter.sendMail(options), timeoutPromise]);
}

app.post("/auth/reset/request", async (req, res) => {
  const { email } = req.body;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ message: "Email is required." });
  }

  const code = generateCode();
  const expiresAt = getExpiryDate();
  pendingResets.set(email.toLowerCase(), { code, expiresAt });

  try {
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "Your Allora Service Hub reset code",
      text: `Here is your password reset code: ${code}. It expires in 10 minutes.`,
      html: `<p>Use this code to reset your password:</p><p style="font-size:24px;font-weight:bold;letter-spacing:6px;">${code}</p><p>This code expires in 10 minutes.</p>`,
    });

    return res.json({ message: "Reset code sent." });
  } catch (error) {
    console.error("[mail] Unable to send reset code:", error.message);
    pendingResets.delete(email.toLowerCase());
    return res
      .status(500)
      .json({ message: "Could not send reset code. Please try again later." });
  }
});

app.post("/auth/reset/verify", (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: "Email and code are required." });
  }

  const record = pendingResets.get(email.toLowerCase());

  if (!record || record.code !== code || new Date() > record.expiresAt) {
    return res.status(400).json({ message: "Invalid or expired code." });
  }

  return res.json({ message: "Code verified." });
});

app.post("/auth/reset/complete", (req, res) => {
  const { email, code, password } = req.body;

  if (!email || !code || !password) {
    return res
      .status(400)
      .json({ message: "Email, code and new password are required." });
  }

  const record = pendingResets.get(email.toLowerCase());

  if (!record || record.code !== code || new Date() > record.expiresAt) {
    return res.status(400).json({ message: "Invalid or expired code." });
  }

  pendingResets.delete(email.toLowerCase());

  console.log(
    `[reset] Password for ${email} would be updated here. (Received length: ${password.length})`
  );

  return res.json({ message: "Password updated." });
});

app.post("/auth/signup", async (req, res) => {
  const { firstName, lastName, dob, region, email, password } = req.body || {};

  if (!firstName || !lastName || !dob || !region || !email || !password) {
    return res
      .status(400)
      .json({ message: "All fields are required to create an account." });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long." });
  }

  const mailPayload = {
    from: process.env.MAIL_USER,
    to: email,
    subject: "Welcome to Allora Service Hub",
    text: `Kia ora ${firstName},

Thanks for signing up to the Allora Service Hub. We have your region recorded as ${region}.

You can now log in using your email address.

Nga mihi,
Allora Support`,
    html: `<p>Kia ora ${firstName},</p>
        <p>Thanks for signing up to the <strong>Allora Service Hub</strong>.</p>
        <p>We have your region recorded as <strong>${region}</strong>. You can now log in using your email address.</p>
        <p style="margin-top:20px;">Nga mihi,<br/>Allora Support</p>`,
  };

  try {
    await sendMailWithTimeout(mailPayload);
    console.log(`[signup] Registered ${email} (${firstName} ${lastName}) from ${region}.`);
    return res.json({ message: "Signup successful. Welcome email sent." });
  } catch (error) {
    console.error("[signup] Welcome email issue:", error.message);
    console.log(`[signup] Registered ${email} (${firstName} ${lastName}) from ${region}, but email may be delayed.`);
    return res.json({
      message: "Signup successful. Welcome email may be delayed; please check your inbox shortly.",
    });
  }
});

app.post("/provider/approve", async (req, res) => {
  const { email, password, businessName, ownerName, category, phone, address } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required to approve a provider." });
  }

  let userRecord;
  try {
    userRecord = await authAdmin.createUser({
      email,
      password,
      displayName: businessName || ownerName || email,
    });
  } catch (error) {
    if (error.code === "auth/email-already-exists") {
      userRecord = await authAdmin.getUserByEmail(email);
    } else {
      console.error("[provider-approval] Failed to create user:", error.message);
      return res.status(500).json({ message: "Unable to create provider login right now." });
    }
  }

  try {
    const userDoc = {
      email,
      role: "Service Provider",
      businessName: businessName || "",
      ownerName: ownerName || "",
      category: category || "General",
      phone: phone || "",
      address: address || "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await firestore.collection("users").doc(userRecord.uid).set(userDoc, { merge: true });
  } catch (error) {
    console.error("[provider-approval] Failed to write Firestore user:", error.message);
    return res.status(500).json({ message: "User created, but unable to save profile." });
  }

  const safeName = businessName || "your business";
  const mailPayload = {
    from: process.env.MAIL_USER,
    to: email,
    subject: "Your Allora provider account has been approved",
    text: `Kia ora,

Good news! Your provider registration for ${safeName} has been approved.

You can now sign in to the Allora Service Hub using the email and password you registered with.

Nga mihi,
Allora Support`,
    html: `<p>Kia ora,</p>
           <p>Good news! Your provider registration for <strong>${safeName}</strong> has been approved.</p>
           <p>You can now sign in to the <strong>Allora Service Hub</strong> using the email and password you registered with.</p>
           <p style="margin-top:20px;">Nga mihi,<br/>Allora Support</p>`,
  };

  try {
    await sendMailWithTimeout(mailPayload);
  } catch (error) {
    console.warn("[provider-approval] User created, email failed:", error.message);
  }

  return res.json({ message: "Provider approved.", uid: userRecord.uid });
});

app.listen(port, () => {
  console.log(`Password reset service running on http://localhost:${port}`);
});
