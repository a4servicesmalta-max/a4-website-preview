"use client";
import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import GradientContainer from "@/components/common/GradientContainer";
import BoxShadow from "@/components/common/BoxShadow";
import FormStatusModal from "@/components/common/FormStatusModal";
import { getCaptchaToken } from "@/lib/turnstileClient";

const QuoteFormSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const [statusMessage, setStatusMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const captchaToken = await getCaptchaToken("quote");
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          captchaToken,
          ...formData,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || "Request failed");
      }

      setFormData({ name: "", email: "", subject: "", message: "" });
      setStatusType("success");
      setStatusMessage("Your quote request has been sent. Our team will review your details and get back to you within 24 hours.");
      setStatusOpen(true);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
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
        title={statusType === "success" ? "Request sent" : "Something went wrong"}
        message={statusMessage}
        onClose={() => setStatusOpen(false)}
      />
      <section className="py-16 lg:py-24">
      <GradientContainer
        className="w-full"
        backgroundColor="bg-[#020410]"
        showRadials={true}
      >
        <div className="max-w-6xl mx-auto py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Left Side: Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative w-full h-[400px] lg:h-full min-h-[500px] rounded-2xl overflow-hidden shadow-2xl"
            >
              <Image
                src="/assets/images/Rectangle 34624273 (1).png"
                alt="Quote Form Illustration"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </motion.div>

            {/* Right Side: Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col"
            >
              <BoxShadow className="h-full flex flex-col justify-center bg-transparent border-white/10 p-6 md:p-8 lg:p-12">
                <h2 className="text-2xl md:text-3xl font-medium text-white mb-5">
                  Complete the form below to receive your tailored quote
                </h2>
                {submitError && (
                  <p className="mb-3 text-sm text-red-400">{submitError}</p>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name Field */}
                  <div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-blue transition-colors"
                      placeholder="Enter your name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-blue transition-colors"
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                  {/* Subject Field */}
                  <div>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-blue transition-colors"
                      placeholder="Enter subject"
                    />
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  {/* Message Field */}
                  <div>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-blue transition-colors resize-none"
                      placeholder="Enter your message (optional)"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center gap-2 bg-primary-blue hover:bg-primary-zinc-hover text-white px-6 py-3 rounded-full transition-all text-[15px] font-medium shadow-primary-blue hover:shadow-[0_6px_40px_var(--primary-zinc-shadow)] transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed justify-center"
                    >
                      {isSubmitting ? "Sending..." : "Send a Quote"}
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </button>
                  </div>
                </form>
              </BoxShadow>
            </motion.div>
          </div>
        </div>
      </GradientContainer>
      </section>
    </>
  );
};

export default QuoteFormSection;
