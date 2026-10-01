"use client";

import React, { useState } from "react";
import FormStatusModal from "../common/FormStatusModal";
import { BODY, Band, PERI, SANS, gradTail } from "@/components/services/SectionKit";
import { CONTACT_EMAIL, CONTACT_EMAIL_HREF } from "@/lib/contact";

interface ContactHRFormProps {
  title?: string;
  subtitle?: string;
  emailLabel?: string;
  form?: {
    labels: {
      name: string;
      email: string;
      role: string;
      message: string;
    };
    placeholders: {
      name: string;
      email: string;
      role: string;
      message: string;
    };
    roles: {
      audit: string;
      tax: string;
      corporate: string;
      tech: string;
      marketing: string;
      other: string;
    };
    submit: string;
    submitting: string;
    success: string;
    error: string;
    modalSuccessTitle: string;
    modalErrorTitle: string;
  };
}

const label: React.CSSProperties = { display: "block", fontFamily: SANS, fontSize: 15, fontWeight: 600, color: "#E4E4E7", marginBottom: 10 };

/**
 * "Join our talent network" — the design's dark CTA: heading and email on the
 * left, the form in the dark card on the right (dark inputs, white pill).
 * Submits to /api/contact exactly as before.
 */
const ContactHRForm = ({ title, subtitle, emailLabel, form }: ContactHRFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const [statusMessage, setStatusMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: `${formData.message}\n\nRole / Area of interest: ${formData.role || "Not specified"}`,
          subject: "Careers / Talent Network enquiry",
          context: "Careers contact form",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || "Request failed");
      }

      setFormData({ name: "", email: "", role: "", message: "" });
      setStatusType("success");
      setStatusMessage(form?.success || "");
      setStatusOpen(true);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : form?.error || "";
      setSubmitError(msg);
      setStatusType("error");
      setStatusMessage(msg);
      setStatusOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const required = (
    <span aria-hidden="true" style={{ color: PERI }}>
      {" "}
      *
    </span>
  );

  return (
    <>
      <FormStatusModal
        open={statusOpen}
        type={statusType}
        title={statusType === "success" ? form?.modalSuccessTitle || "" : form?.modalErrorTitle || ""}
        message={statusMessage}
        onClose={() => setStatusOpen(false)}
      />
      <Band id="talent-network" surface="dark">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 440px), 1fr))", gap: "56px 72px", alignItems: "center" }}>
          <div>
            {title ? (
              <h2 data-fx="rise" style={{ margin: 0, fontSize: "clamp(44px,5.6vw,92px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.02, color: "#FFFFFF", textWrap: "balance" }}>
                {gradTail(title, 2)}
              </h2>
            ) : null}
            {subtitle ? (
              <p data-fx="rise" data-d="100" style={{ margin: "24px 0 0", maxWidth: 540, fontFamily: BODY, fontSize: 18, lineHeight: 1.55, color: "#A1A1AA" }}>
                {subtitle}
              </p>
            ) : null}
            <p data-fx="rise" data-d="180" style={{ margin: "28px 0 0", fontFamily: SANS, fontSize: 19, fontWeight: 500, letterSpacing: "-0.015em", color: "#A1A1AA" }}>
              {emailLabel}{" "}
              <a href={CONTACT_EMAIL_HREF} style={{ color: "#FFFFFF", textDecoration: "underline", textDecorationColor: "rgba(139,143,247,.6)", textUnderlineOffset: 4 }}>
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>

          <div
            data-fx="rise"
            data-d="200"
            style={{ padding: "clamp(24px,3.4vw,40px)", borderRadius: 28, background: "rgba(24,24,27,.92)", border: "1px solid rgba(255,255,255,.1)", boxShadow: "0 40px 100px rgba(0,0,0,.45)" }}
          >
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 20 }}>
                <div>
                  <label htmlFor="name" style={label}>
                    {form?.labels.name}
                    {required}
                  </label>
                  <input type="text" id="name" name="name" required autoComplete="name" value={formData.name} onChange={handleChange} className="a4-input-dark" placeholder={form?.placeholders.name} />
                </div>
                <div>
                  <label htmlFor="email" style={label}>
                    {form?.labels.email}
                    {required}
                  </label>
                  <input type="email" id="email" name="email" required autoComplete="email" value={formData.email} onChange={handleChange} className="a4-input-dark" placeholder={form?.placeholders.email} />
                </div>
              </div>

              <div>
                <label htmlFor="role" style={label}>
                  {form?.labels.role}
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="a4-input-dark"
                    style={{ appearance: "none", WebkitAppearance: "none", paddingRight: 48, cursor: "pointer", color: formData.role ? "#FFFFFF" : "#71717A" }}
                  >
                    <option value="" disabled>
                      {form?.placeholders.role}
                    </option>
                    <option value="audit">{form?.roles.audit}</option>
                    <option value="tax">{form?.roles.tax}</option>
                    <option value="corporate">{form?.roles.corporate}</option>
                    <option value="tech">{form?.roles.tech}</option>
                    <option value="marketing">{form?.roles.marketing}</option>
                    <option value="other">{form?.roles.other}</option>
                  </select>
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true" style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#A1A1AA" }}>
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              <div>
                <label htmlFor="message" style={label}>
                  {form?.labels.message}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="a4-input-dark"
                  placeholder={form?.placeholders.message}
                  style={{ height: "auto", minHeight: 140, padding: "16px 18px", lineHeight: 1.5, resize: "vertical" }}
                />
              </div>

              <div style={{ paddingTop: 6, display: "flex", flexDirection: "column", gap: 12 }}>
                {submitError ? (
                  <p role="alert" style={{ margin: 0, fontFamily: BODY, fontSize: 14, lineHeight: 1.5, color: "#FFFFFF" }}>
                    {submitError}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="a4-btn a4-btn-light"
                  style={{ width: "100%", height: 64, fontSize: 19, opacity: isSubmitting ? 0.6 : 1, cursor: isSubmitting ? "default" : "pointer" }}
                >
                  {isSubmitting ? form?.submitting : form?.submit}
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </Band>
    </>
  );
};

export default ContactHRForm;
