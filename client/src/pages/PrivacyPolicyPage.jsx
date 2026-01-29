import { Link } from "react-router-dom";
import "./PrivacyPolicyPage.css";

function PrivacyPolicyPage() {
  return (
    <div className="privacy-page">
      <div className="privacy-card">
        <header className="privacy-header">
          <h1>Privacy Policy</h1>
          <p className="privacy-updated">Last updated: January 2026</p>
        </header>
        <section className="privacy-section">
          <h2>What Data We Collect</h2>
          <p>
            We collect only your <strong>email address</strong> when you subscribe to the newsletter.
            We do not collect names, phone numbers, or any other personal information.
            This site does not use tracking cookies or analytics that identify individual users.
          </p>
        </section>
        <section className="privacy-section">
          <h2>Why We Collect It</h2>
          <p>
            Your email is used solely to send you notifications when new blog posts are published.
            We will never sell, rent, or share your email address with third parties for marketing purposes.
          </p>
        </section>
        <section className="privacy-section">
          <h2>Third-Party Services</h2>
          <p>
            We use <strong>Resend</strong> as our email service provider to deliver newsletter emails.
            Resend processes your email address on our behalf to send you notifications.
            You can review Resend's privacy practices at{" "}
            <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
              resend.com/legal/privacy-policy
            </a>.
          </p>
        </section>
        <section className="privacy-section">
          <h2>Data Retention</h2>
          <p>We retain your data according to the following schedule:</p>
          <ul className="privacy-list">
            <li>
              <strong>Unconfirmed subscriptions:</strong> Automatically deleted after 7 days if not confirmed
            </li>
            <li>
              <strong>Active subscribers:</strong> Retained until you unsubscribe
            </li>
            <li>
              <strong>After unsubscribing:</strong> Your data is soft-deleted and permanently purged after 30 days
            </li>
            <li>
              <strong>Deletion requests:</strong> Immediate permanent deletion upon request
            </li>
          </ul>
        </section>
        <section className="privacy-section">
          <h2>Your Rights</h2>
          <p>You have the following rights regarding your data:</p>
          <ul className="privacy-list">
            <li>
              <strong>Right to unsubscribe:</strong> Every email includes an unsubscribe link
            </li>
            <li>
              <strong>Right to erasure:</strong> Request immediate deletion of all your data at any time
            </li>
            <li>
              <strong>Right to access:</strong> Request information about what data we hold about you
            </li>
          </ul>
          <p>
            When you unsubscribe, you'll be given the option to delete your data immediately
            or let it be automatically purged after 30 days.
          </p>
        </section>
        <section className="privacy-section">
          <h2>Contact</h2>
          <p>
            For privacy-related questions or to exercise your data rights, contact us at:{" "}
            <a href="mailto:sahil@sahilbasumatary.dev">sahil@sahilbasumatary.dev</a>
          </p>
        </section>
        <footer className="privacy-footer">
          <Link to="/" className="privacy-back-link">
            ← Back to Home
          </Link>
        </footer>
      </div>
    </div>
  );
}

export default PrivacyPolicyPage;

