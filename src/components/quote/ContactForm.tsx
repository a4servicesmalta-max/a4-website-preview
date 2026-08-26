"use client";
import React, { useState } from "react";
import { Mail, Phone, MapPin, PhoneCall } from "lucide-react";
import { motion } from "framer-motion";
import FormStatusModal from "@/components/common/FormStatusModal";
import { useLocalizedHref } from "@/components/a4-site/useLocalizedHref";
import { BOOK_A_CALL_PATH } from "@/lib/external-links";
import { usePagesTranslation } from "@/hooks/usePagesTranslation";
import { trackConversion } from "@/lib/analytics";
import { getCaptchaToken } from "@/lib/turnstileClient";

const ContactForm = () => {
  const { t } = usePagesTranslation("contact");
  const localizedHref = useLocalizedHref();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
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
      newErrors.name = t("form.validation.nameRequired");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("form.validation.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("form.validation.emailInvalid");
    }

    if (!formData.message.trim()) {
      newErrors.message = t("form.validation.messageRequired");
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
      const captchaToken = await getCaptchaToken("contact");
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          captchaToken,
          ...formData,
          subject: "Website contact form",
          context: "Contact page form",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || t("form.error.generic"));
      }

      trackConversion("contact");
      setFormData({ name: "", email: "", message: "" });
      setStatusType("success");
      setStatusMessage(t("form.success.message"));
      setStatusOpen(true);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : t("form.error.generic");
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
        title={statusType === "success" ? t("form.success.title") : t("form.error.title")}
        message={statusMessage}
        onClose={() => setStatusOpen(false)}
      />
      <section id="contact-form" className="py-16 lg:py-24 scroll-mt-20 bg-[#F3F5F7]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="rounded-2xl p-6 md:p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Left Column: Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100"
              >
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-medium mb-3">
                  {t("form.badge")}
                </span>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-heading mb-3">
                  {t("form.title")}
                </h2>
                <p className="text-sm md:text-base text-gray mb-6 leading-relaxed">
                  {t("form.description")}
                </p>
                {submitError && (
                  <p className="mb-4 text-sm text-error">{submitError}</p>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name Field */}
                  <div>
                    <label htmlFor="name" className="sr-only">{t("form.fields.name.label")}</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-blue transition-colors hover:border-primary-blue/60 ${errors.name ? "border-error" : "border-input"
                        }`}
                      placeholder={t("form.fields.name.placeholder")}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-error">{errors.name}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="sr-only">{t("form.fields.email.label")}</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-blue transition-colors hover:border-primary-blue/60 ${errors.email ? "border-error" : "border-input"
                        }`}
                      placeholder={t("form.fields.email.placeholder")}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-error">{errors.email}</p>
                    )}
                  </div>

                  {/* Message Field */}
                  <div>
                    <label htmlFor="message" className="sr-only">{t("form.fields.message.label")}</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className={`w-full px-4 py-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-blue transition-colors resize-none hover:border-primary-blue/60 ${errors.message ? "border-error" : "border-input"
                        }`}
                      placeholder={t("form.fields.message.placeholder")}
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-error">{errors.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.98, y: 0 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary-blue hover:bg-primary-zinc-hover text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  >
                    {isSubmitting ? t("form.submitting") : t("form.submit")}
                  </motion.button>
                </form>
              </motion.div>

              {/* Right Column: Contact Information */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex flex-col justify-start"
              >
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-heading mb-3">
                  {t("info.title")}
                </h2>
                <p className="text-sm md:text-base text-gray mb-6 leading-relaxed max-w-md">
                  {t("info.description")}
                </p>

                <div className="space-y-6 mb-8">
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-blue rounded-full flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-heading mb-1">
                        {t("info.email.label")}
                      </p>
                      <a
                        href={`mailto:${t("info.email.value")}`}
                        className="text-sm md:text-base text-gray hover:text-primary-blue transition-colors"
                      >
                        {t("info.email.value")}
                      </a>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-blue rounded-full flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-heading mb-1">
                        {t("info.phone.label")}
                      </p>
                      <div className="flex flex-col leading-tight">
                        {((t("info.phone.values", { returnObjects: true }) as unknown) as string[] || []).map((phone, idx) => (
                          <a
                            key={idx}
                            href={`tel:${phone.replace(/\s+/g, "")}`}
                            className="text-sm md:text-base text-gray hover:text-primary-blue transition-colors"
                          >
                            {phone}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-blue rounded-full flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-heading mb-1">
                        {t("info.address.label")}
                      </p>
                      <p className="text-sm md:text-base text-gray">
                        {t("info.address.value")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="mt-auto">
                  <p className="text-base md:text-lg font-semibold text-heading mb-4">
                    {t("info.cta.title")}
                  </p>
                  <motion.a
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.97, y: 0 }}
                    href={localizedHref(BOOK_A_CALL_PATH)}
                    className="bg-primary-blue hover:bg-primary-zinc-hover text-white font-semibold py-4 px-6 rounded-full transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                  >
                    <span>{t("info.cta.button")}</span>
                    <PhoneCall className="w-5 h-5" />
                  </motion.a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactForm;
