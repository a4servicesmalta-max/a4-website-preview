"use client"

import React, { useState, useRef } from "react"
import { SERVICE_TYPE_OPTIONS } from "@/data/serviceRequestForms"
import { cn } from "@/lib/utils"
import { CLIENT_ONBOARDING_URL } from "@/lib/external-links"
import { getCaptchaToken } from "@/lib/turnstileClient";

type FormData = {
  name: string
  email: string
  message: string
  service: string[]
  additionalDetails: string
  communicationChannel: string
  updateCadence: string
  phone: string
}

type FormField = {
  key: keyof FormData
  label: string
  placeholder?: string
  type: "text" | "email" | "textarea" | "select" | "multiselect"
  autoComplete?: string
  options?: string[]
  rows?: number
}

type FormStep = {
  id: string
  fields: FormField[]
  primaryLabel?: string
  title?: string
  subtitle?: string
}

const formSteps: FormStep[] = [
  {
    id: "request",
    title: "Let's Start",
    subtitle: "Tell us a bit about yourself",
    fields: [
      { key: "name", label: "Full Name", placeholder: "e.g. John Doe", type: "text", autoComplete: "name" },
      { key: "email", label: "Email Address", placeholder: "john@company.com", type: "email", autoComplete: "email" },
      { key: "message", label: "Project Brief", placeholder: "Describe your needs...", type: "textarea", rows: 2 },
    ],
    primaryLabel: "Continue",
  },
  {
    id: "onboarding",
    title: "Project Scope",
    subtitle: "Choose the type of service you need",
    fields: [
      {
        key: "service",
        label: "Service Types",
        placeholder: "Select services",
        type: "multiselect",
        options: SERVICE_TYPE_OPTIONS.map((o) => o.value),
      },
      {
        key: "additionalDetails",
        label: "Additional details (optional)",
        placeholder: "Any specific requirements...",
        type: "textarea",
        rows: 4
      }
    ],
    primaryLabel: "Next Step",
  },
  {
    id: "preferences",
    title: "Final Touches",
    subtitle: "How should we contact you?",
    fields: [
      { key: "communicationChannel", label: "Communication", placeholder: "Preferred Channel", type: "select", options: ["Email", "WhatsApp", "Phone Call", "Portal"] },
      { key: "updateCadence", label: "Updates", placeholder: "Frequency", type: "select", options: ["Weekly", "Bi-weekly", "Monthly", "Urgent Only"] },
      { key: "phone", label: "Phone Number (required for WhatsApp / Phone Call)", placeholder: "+356 1234 5678", type: "text" },
    ],
    primaryLabel: "Submit Request",
  },
]

const processSteps = [
  { title: "Define", description: "Request a quote and define your scope." },
  { title: "Onboard", description: "We align on goals, timelines, and details." },
  { title: "Execute", description: "We do the work while keeping you in the loop." },
]

const ProcessStepsSection = () => {
  const bgRef = useRef(null)

  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
    service: [],
    additionalDetails: "",
    communicationChannel: "",
    updateCadence: "",
    phone: "",
  })

  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [direction, setDirection] = useState(0)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [openSelectKey, setOpenSelectKey] = useState<string | null>(null)

  const step = formSteps[currentStep]

  const validateStep = () => {
    for (const field of step.fields) {
      if (field.key === "additionalDetails") continue

      if (field.type === "multiselect") {
        const val = formData[field.key] as string[]
        if (!val || val.length === 0) return `${field.label} is required.`
      } else {
        const val = formData[field.key]
        if (!val || (typeof val === "string" && !val.trim())) return `${field.label} is required.`
        if (field.key === "email" && typeof val === "string" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "Invalid email address."
      }
    }

    if (
      step.id === "preferences" &&
      formData.communicationChannel &&
      formData.communicationChannel !== "Email" &&
      !formData.phone.trim()
    ) {
      return "Phone number is required for this communication method."
    }

    return ""
  }

  const handleNext = () => {
    const msg = validateStep()
    if (msg) {
      setError(msg)
      return
    }
    setError("")
    setDirection(1)
    setCurrentStep((prev) => Math.min(prev + 1, formSteps.length - 1))
  }

  const handleBack = () => {
    setError("")
    setDirection(-1)
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitted || isSubmitting) return
    if (currentStep < formSteps.length - 1) {
      handleNext()
      return
    }
    const msg = validateStep()
    if (msg) {
      setError(msg)
      return
    }

    setError("")
    setSubmitError(null)

    try {
      const payloadMeta = {
        services: formData.service,
        additionalDetails: formData.additionalDetails || undefined,
        communicationChannel: formData.communicationChannel,
        updateCadence: formData.updateCadence,
        phone: formData.phone || undefined,
      }

      const form = new FormData()
      form.append("name", formData.name)
      form.append("email", formData.email)
      form.append("subject", "Homepage quote / project request")
      form.append("message", formData.message)
      form.append("metaJson", JSON.stringify(payloadMeta))

      setIsSubmitting(true)

      const captchaToken = await getCaptchaToken("quote")
      if (captchaToken) form.append("captchaToken", captchaToken)

      const res = await fetch("/api/quote", {
        method: "POST",
        body: form,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error || "Request failed")
      }
      setSubmitted(true)
    } catch (err) {
      console.error(err)
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (key: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    if (error) setError("")
  }

  return (
    <section
      id="process-steps"
      ref={bgRef}
      className="w-full relative overflow-hidden py-12 sm:py-16 lg:py-20 scroll-mt-20 isolate bg-[#FAFBFF]"
    >
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-zinc-50/50 rounded-full blur-[120px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-zinc-50/40 rounded-full blur-[100px] -ml-32 -mb-32" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(#000000 0.5px, transparent 0.5px)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative z-10 w-full lg:order-1">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_30px_70px_-20px_rgba(30,58,138,0.08)] overflow-hidden">
              <div className="p-1 sm:p-2">
                <div className="bg-slate-50/50 rounded-[2.2rem] p-6 sm:p-8 md:p-10">
                  {!submitted ? (
                    <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-[520px]">
                      <div className="flex items-center justify-between mb-10 px-2">
                        {formSteps.map((_, idx) => (
                          <React.Fragment key={idx}>
                            <div className="flex flex-col items-center gap-2">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500",
                                idx <= currentStep
                                  ? "bg-zinc-600 text-white shadow-lg shadow-zinc-500/30"
                                  : "bg-white border border-slate-200 text-slate-400"
                              )}>
                                {idx + 1}
                              </div>
                            </div>
                            {idx < formSteps.length - 1 && (
                              <div className={cn(
                                "h-px grow mx-4 transition-colors duration-700",
                                idx < currentStep ? "bg-zinc-600" : "bg-slate-200"
                              )} />
                            )}
                          </React.Fragment>
                        ))}
                      </div>

                      <div className="mb-8">
                        <div>
                          <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                            {step.title}
                          </h3>
                          <p className="text-slate-500 font-medium">
                            {step.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="grow relative">
                        <div className="space-y-6">
                          {step.fields.map((field) => (
                            <div key={field.key} className="space-y-2">
                              <label className="text-sm font-bold text-slate-700 block ml-1">
                                {field.label} {field.key === "additionalDetails" ? "" : <span className="text-red-500">*</span>}
                              </label>

                              {field.type === "select" ? (
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={() => setOpenSelectKey((prev) => (prev === field.key ? null : field.key))}
                                    className="w-full h-14 rounded-2xl border border-slate-200 bg-white px-5 text-left text-sm font-semibold text-slate-900 shadow-sm transition-all hover:border-zinc-300 focus:outline-none focus:ring-4 focus:ring-zinc-600/5"
                                  >
                                    <span className={formData[field.key] ? "text-slate-900" : "text-slate-400"}>
                                      {(formData[field.key] as string) || field.placeholder}
                                    </span>
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
                                      <svg className={cn("w-5 h-5 transition-transform", openSelectKey === field.key && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </span>
                                  </button>

                                  {openSelectKey === field.key && (
                                    <>
                                      <div className="fixed inset-0 z-20" onClick={() => setOpenSelectKey(null)} />
                                      <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl py-2">
                                        {field.options?.map((opt) => (
                                          <button
                                            key={opt}
                                            type="button"
                                            onClick={() => { handleChange(field.key, opt); setOpenSelectKey(null); }}
                                            className={cn(
                                              "flex w-full px-5 py-3 text-sm font-medium transition-colors",
                                              (formData[field.key] as string) === opt ? "bg-zinc-50 text-zinc-700" : "text-slate-600 hover:bg-slate-50"
                                            )}
                                          >
                                            {opt}
                                          </button>
                                        ))}
                                      </div>
                                    </>
                                  )}
                                </div>
                              ) : field.type === "multiselect" ? (
                                <div className="relative z-10">
                                  <button
                                    type="button"
                                    onClick={() => setOpenSelectKey((prev) => (prev === field.key ? null : field.key))}
                                    className="w-full min-h-[56px] py-3 rounded-2xl border border-slate-200 bg-white px-5 text-left text-sm font-semibold text-slate-900 shadow-sm transition-all hover:border-zinc-300 focus:outline-none focus:ring-4 focus:ring-zinc-600/5 pr-12 flex flex-wrap gap-2 items-center"
                                  >
                                    {(formData[field.key] as string[]).length > 0 ? (
                                      (formData[field.key] as string[]).map((selected) => (
                                        <div key={selected} className="bg-zinc-50 text-zinc-700 px-3 py-1 rounded-full text-xs font-bold border border-zinc-100 flex items-center gap-1 z-20">
                                          {selected}
                                          <div
                                            className="w-4 h-4 rounded-full hover:bg-zinc-200 inline-flex items-center justify-center cursor-pointer transition-colors"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const arr = formData[field.key] as string[];
                                              handleChange(field.key, arr.filter(x => x !== selected));
                                            }}
                                          >
                                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <span className="text-slate-400">{field.placeholder}</span>
                                    )}
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
                                      <svg className={cn("w-5 h-5 transition-transform", openSelectKey === field.key && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </span>
                                  </button>

                                  {openSelectKey === field.key && (
                                    <>
                                      <div className="fixed inset-0 z-[19]" onClick={() => setOpenSelectKey(null)} />
                                      <div className="absolute z-[30] mt-2 w-full max-h-[300px] overflow-y-auto rounded-2xl border border-slate-100 bg-white shadow-2xl py-2">
                                        {field.options?.map((opt) => {
                                          const isSelected = (formData[field.key] as string[]).includes(opt);
                                          return (
                                            <button
                                              key={opt}
                                              type="button"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                const arr = formData[field.key] as string[];
                                                handleChange(field.key, isSelected ? arr.filter(x => x !== opt) : [...arr, opt]);
                                              }}
                                              className={cn(
                                                "flex w-full items-center justify-between px-5 py-3 text-sm font-medium transition-colors",
                                                isSelected ? "bg-zinc-50 text-zinc-700" : "text-slate-600 hover:bg-slate-50"
                                              )}
                                            >
                                              <span>{opt}</span>
                                              {isSelected && (
                                                <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                              )}
                                            </button>
                                          )
                                        })}
                                      </div>
                                    </>
                                  )}
                                </div>
                              ) : field.type === "textarea" ? (
                                <textarea
                                  value={formData[field.key] as string}
                                  onChange={(e) => handleChange(field.key, e.target.value)}
                                  placeholder={field.placeholder}
                                  rows={field.rows}
                                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-zinc-600/5 focus:border-zinc-400 transition-all font-medium min-h-[100px] resize-none"
                                />
                              ) : (
                                <input
                                  type={field.type}
                                  value={formData[field.key] as string}
                                  onChange={(e) => handleChange(field.key, e.target.value)}
                                  placeholder={field.placeholder}
                                  className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-zinc-600/5 focus:border-zinc-400 transition-all font-medium"
                                />
                              )}
                            </div>
                          ))}

                        </div>
                      </div>

                      {error && (
                        <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0 uppercase font-black text-[10px]">!</div>
                          <p className="text-sm font-bold text-red-700">{error}</p>
                        </div>
                      )}

                      {submitError && (
                        <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0 uppercase font-black text-[10px]">!</div>
                          <p className="text-sm font-bold text-red-700">{submitError}</p>
                        </div>
                      )}

                      <div className="mt-10 flex flex-col gap-4">
                        <div className="flex items-center gap-4 w-full">
                          {currentStep > 0 && (
                            <button
                              type="button"
                              onClick={handleBack}
                              className="h-14 px-8 rounded-2xl font-black text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all tracking-widest uppercase text-xs"
                            >
                              Back
                            </button>
                          )}
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="grow h-14 rounded-2xl bg-zinc-600 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-zinc-600/20 transition-all hover:bg-zinc-700 hover:shadow-zinc-600/40 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
                          >
                            {isSubmitting && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                            {isSubmitting ? "Processing..." : (step.primaryLabel || "Next Step")}
                          </button>
                        </div>


                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col items-center justify-center min-h-[520px] text-center p-6 lg:p-10">
                      <div className="w-24 h-24 bg-green-50 rounded-[2rem] flex items-center justify-center text-green-500 mb-8 shadow-inner border border-green-100">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Request Received</h3>
                      <p className="text-slate-500 font-medium max-w-sm mx-auto mb-10">
                        We've received your request. Our team will review the details and get back to you within 24 hours.
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <button
                          onClick={() => { setSubmitted(false); setCurrentStep(0); setFormData({ name: "", email: "", message: "", service: [], additionalDetails: "", communicationChannel: "", updateCadence: "", phone: "" }); }}
                          className="flex-1 h-14 rounded-2xl bg-slate-100 text-slate-900 font-bold tracking-wide text-sm transition-all hover:bg-slate-200 border border-slate-200"
                        >
                          New Request
                        </button>
                        <a
                          href={CLIENT_ONBOARDING_URL}
                          className="flex-1 flex items-center justify-center h-14 rounded-2xl bg-zinc-600 text-white font-bold tracking-wide text-sm shadow-xl shadow-zinc-600/20 border border-zinc-500 transition-all hover:bg-zinc-700"
                        >
                          Register Now
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="relative lg:pl-10 h-full flex flex-col justify-center lg:order-2">
            <div className="mb-10">
              <h2 className="text-sm font-black text-zinc-600 uppercase tracking-[0.2em] mb-4">Workflow Progress</h2>
              <h3 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Real-time <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-zinc-600 to-zinc-800">Onboarding State</span>
              </h3>
            </div>

            <div className="space-y-4 relative">
              {processSteps.map((s, idx) => {
                const isActive = idx === currentStep;
                const isPast = idx < currentStep;

                return (
                  <div
                    key={idx}
                    className={cn(
                      "group relative rounded-3xl p-5 sm:p-6 transition-all duration-500 border",
                      isActive
                        ? "bg-white border-zinc-100 shadow-[0_20px_40px_-15px_rgba(37,99,235,0.12)] scale-[1.02] z-20"
                        : "bg-slate-50/50 border-transparent opacity-60 hover:opacity-80"
                    )}
                  >
                    <div className="flex items-start gap-5">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500",
                        isActive ? "bg-zinc-600 text-white rotate-3 shadow-lg shadow-zinc-500/40" :
                          isPast ? "bg-green-100 text-green-600" : "bg-white text-slate-400"
                      )}>
                        {isPast ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <span className="text-lg font-black">{idx + 1}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={cn(
                            "text-lg font-black transition-colors",
                            isActive ? "text-slate-900" : "text-slate-500"
                          )}>
                            {s.title}
                          </h4>
                          {isActive && (
                            <span className="flex h-2 w-2 rounded-full bg-zinc-600 animate-pulse" />
                          )}
                        </div>
                        {(isActive || isPast) && (
                          <p className="text-sm font-medium text-slate-500 leading-relaxed overflow-hidden">
                            {s.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {isActive && (
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-12 bg-zinc-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.8)] lg:block hidden" />
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-12 p-8 rounded-[2rem] bg-linear-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-zinc-400 text-xs font-black uppercase tracking-widest mb-2">Platform Power</p>
                <p className="text-lg font-bold leading-snug">
                  Experience the future of <br />corporate management.
                </p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            </div>

            <div className="mt-6">
              <a
                href={CLIENT_ONBOARDING_URL}
                className="group relative flex w-full items-center justify-center h-16 rounded-[1.5rem] bg-white border-2 border-slate-200 text-slate-900 font-black tracking-wide text-sm transition-all hover:bg-slate-50 hover:border-zinc-300 overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full bg-linear-to-r from-zinc-50 to-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 uppercase flex items-center gap-3">
                  Register Directly
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default ProcessStepsSection
