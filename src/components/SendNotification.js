import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function SendNotification({ show, onHide, providerEmail }) {
  const [formData, setFormData] = useState({
    subject: "",
    message: ""
  });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) return;

    setSending(true);
    try {
      await addDoc(collection(db, "Notification"), {
        audience: "Service Providers",
        providerEmail: providerEmail.toLowerCase(),
        subject: formData.subject,
        message: formData.message,
        status: "New",
        sentAt: serverTimestamp(),
        sentBy: "Administrator"
      });
      
      setFormData({ subject: "", message: "" });
      onHide();
    } catch (error) {
      console.error("Error sending notification:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Send Message to Provider</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>To: {providerEmail}</Form.Label>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Subject</Form.Label>
            <Form.Control
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Message</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={sending}>
          {sending ? "Sending..." : "Send Message"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}