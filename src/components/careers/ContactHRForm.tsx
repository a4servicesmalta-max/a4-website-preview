"use client";

import React, { useState } from "react";
import { FadeInUp } from "../common/Animations";
import { motion } from "framer-motion";
import GradientContainer from "../common/GradientContainer";
import FormStatusModal from "../common/FormStatusModal";
import { getCaptchaToken } from "@/lib/turnstileClient";

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

const ContactHRForm = ({
  title,
  subtitle,
  emailLabel,
  form
}: ContactHRFormProps) => {
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
      const captchaToken = await getCaptchaToken("contact");
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          captchaToken,
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
      const msg = err instanceof Error ? err.message : (form?.error || "");
      setSubmitError(msg);
      setStatusType("error");
      setStatusMessage(msg);
      setStatusOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <FormStatusModal
        open={statusOpen}
        type={statusType}
        title={statusType === "success" ? (form?.modalSuccessTitle || "") : (form?.modalErrorTitle || "")}
        message={statusMessage}
        onClose={() => setStatusOpen(false)}
      />
      <GradientContainer className="py-20 lg:py-28 overflow-hidden" showRadials={false} backgroundColor="bg-[#020410]">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <FadeInUp>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">
                {title}
              </h2>
              <div className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
                <p>{subtitle}</p>
                <div className="mt-8">
                  {emailLabel} <a href="mailto:info@a4.com.mt" className="text-white font-semibold hover:text-primary-blue transition-colors">info@a4.com.mt</a>
                </div>
              </div>
            </FadeInUp>
          </div>

          <FadeInUp delay={0.2}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Decorative header strip */}
              <div className="h-2 bg-gradient-brand w-full" />

              <div className="p-8 md:p-12 lg:p-14">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2.5">
                      <label htmlFor="name" className="text-sm font-semibold text-text-heading ml-1">
                        {form?.labels.name} <span className="text-primary-blue">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-5 py-4 rounded-xl bg-section-light border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-primary-blue/30 focus:bg-white transition-all outline-none placeholder:text-gray-400 font-medium text-text-heading"
                        placeholder={form?.placeholders.name}
                      />
                    </div>
                    <div className="space-y-2.5">
                      <label htmlFor="email" className="text-sm font-semibold text-text-heading ml-1">
                        {form?.labels.email} <span className="text-primary-blue">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-5 py-4 rounded-xl bg-section-light border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-primary-blue/30 focus:bg-white transition-all outline-none placeholder:text-gray-400 font-medium text-text-heading"
                        placeholder={form?.placeholders.email}
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label htmlFor="role" className="text-sm font-semibold text-text-heading ml-1">
                      {form?.labels.role}
                    </label>
                    <div className="relative">
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-5 py-4 rounded-xl bg-section-light border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-primary-blue/30 focus:bg-white transition-all outline-none text-text-heading font-medium appearance-none"
                      >
                        <option value="" disabled>{form?.placeholders.role}</option>
                        <option value="audit">{form?.roles.audit}</option>
                        <option value="tax">{form?.roles.tax}</option>
                        <option value="corporate">{form?.roles.corporate}</option>
                        <option value="tech">{form?.roles.tech}</option>
                        <option value="marketing">{form?.roles.marketing}</option>
                        <option value="other">{form?.roles.other}</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label htmlFor="message" className="text-sm font-semibold text-text-heading ml-1">
                      {form?.labels.message}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-5 py-4 rounded-xl bg-section-light border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-primary-blue/30 focus:bg-white transition-all outline-none placeholder:text-gray-400 resize-none font-medium text-text-heading"
                      placeholder={form?.placeholders.message}
                    />
                  </div>

                  <div className="pt-4 space-y-3">
                    {submitError && (
                      <p className="text-sm text-red-500">{submitError}</p>
                    )}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary text-white text-lg font-bold py-4 rounded-xl hover:bg-primary-blue transition-all shadow-xl hover:shadow-primary-blue/25 active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (form?.submitting) : (form?.submit)}
                      <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </FadeInUp>
        </div>
      </GradientContainer>
    </>
  );
};

export default ContactHRForm;
