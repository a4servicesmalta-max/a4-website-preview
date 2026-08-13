"use client"

import React, { useMemo, useState, useRef } from "react"
import { useTranslation } from "react-i18next"
import { SERVICE_TYPE_OPTIONS } from "@/data/serviceRequestForms"
import { cn } from "@/lib/utils"
import { CLIENT_ONBOARDING_URL } from "@/lib/external-links"
import { SectionTitleHero } from "@/components/HomePage/SectionTitleHero"
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

const ProcessStepsSectionDark = ({ isDark = false }: { isDark?: boolean }) => {
  const { t } = useTranslation("home")
  const bgRef = useRef(null)

  const formSteps = useMemo((): FormStep[] => {
    const comm = t("processSteps.communicationOptions", { returnObjects: true }) as string[]
    const upd = t("processSteps.updateOptions", { returnObjects: true }) as string[]
    const fq = (base: string, key: string) => t(`${base}.${key}.label`)
    const fp = (base: string, key: string) => t(`${base}.${key}.placeholder`)
    return [
      {
        id: "request",
        title: t("processSteps.form.request.title"),
        subtitle: t("processSteps.form.request.subtitle"),
        fields: [
          { key: "name", label: fq("processSteps.form.request.fields", "name"), placeholder: fp("processSteps.form.request.fields", "name"), type: "text", autoComplete: "name" },
          { key: "email", label: fq("processSteps.form.request.fields", "email"), placeholder: fp("processSteps.form.request.fields", "email"), type: "email", autoComplete: "email" },
          { key: "message", label: fq("processSteps.form.request.fields", "message"), placeholder: fp("processSteps.form.request.fields", "message"), type: "textarea", rows: 2 },
        ],
        primaryLabel: t("processSteps.form.request.primaryLabel"),
      },
      {
        id: "onboarding",
        title: t("processSteps.form.onboarding.title"),
        subtitle: t("processSteps.form.onboarding.subtitle"),
        fields: [
          {
            key: "service",
            label: fq("processSteps.form.onboarding.fields", "service"),
            placeholder: fp("processSteps.form.onboarding.fields", "service"),
            type: "multiselect",
            options: SERVICE_TYPE_OPTIONS.map((o) => o.value),
          },
          {
            key: "additionalDetails",
            label: fq("processSteps.form.onboarding.fields", "additionalDetails"),
            placeholder: fp("processSteps.form.onboarding.fields", "additionalDetails"),
            type: "textarea",
            rows: 4,
          },
        ],
        primaryLabel: t("processSteps.form.onboarding.primaryLabel"),
      },
      {
        id: "preferences",
        title: t("processSteps.form.preferences.title"),
        subtitle: t("processSteps.form.preferences.subtitle"),
        fields: [
          { key: "communicationChannel", label: fq("processSteps.form.preferences.fields", "communicationChannel"), placeholder: fp("processSteps.form.preferences.fields", "communicationChannel"), type: "select", options: Array.isArray(comm) ? comm : [] },
          { key: "updateCadence", label: fq("processSteps.form.preferences.fields", "updateCadence"), placeholder: fp("processSteps.form.preferences.fields", "updateCadence"), type: "select", options: Array.isArray(upd) ? upd : [] },
          { key: "phone", label: fq("processSteps.form.preferences.fields", "phone"), placeholder: fp("processSteps.form.preferences.fields", "phone"), type: "text" },
        ],
        primaryLabel: t("processSteps.form.preferences.primaryLabel"),
      },
    ]
  }, [t])

  const processSteps = useMemo(
    () =>
      (t("processSteps.sidebarSteps", { returnObjects: true }) as { title: string; description: string }[]) ?? [],
    [t]
  )

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
        if (!val || val.length === 0) return t("processSteps.errors.fieldRequired", { field: field.label })
      } else {
        const val = formData[field.key]
        if (!val || (typeof val === "string" && !val.trim())) return t("processSteps.errors.fieldRequired", { field: field.label })
        if (field.key === "email" && typeof val === "string" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return t("processSteps.errors.invalidEmail")
      }
    }

    if (
      step.id === "preferences" &&
      formData.communicationChannel &&
      formData.communicationChannel !== "Email" &&
      !formData.phone.trim()
    ) {
      return t("processSteps.errors.phoneRequired")
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
      form.append("subject", t("processSteps.subjectLine"))
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
      setSubmitError(err instanceof Error ? err.message : t("processSteps.errors.generic"))
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
      className={cn(
        "w-full max-w-[100%] relative overflow-x-clip overflow-y-visible py-12 sm:py-16 lg:py-20 scroll-mt-20 isolate mx-4 sm:mx-6 lg:mx-8 mb-12 sm:mb-20 rounded-[48px]",
        isDark ? "bg-[#05050A] text-white shadow-2xl" : "bg-[#FAFBFF] text-slate-900 border border-slate-100 shadow-xl shadow-zinc-500/5"
      )}
    >
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-blue/10 rounded-full blur-[120px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-zinc-500/10 rounded-full blur-[100px] -ml-32 -mb-32" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 min-w-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center min-w-0">
          <div className="relative z-10 w-full min-w-0 lg:order-1">
            <div className="bg-[#09090B] rounded-[2.5rem] border border-white/20 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden">
              <div className="p-1 sm:p-2">
                <div className="bg-[#1A1C33]/50 rounded-[2.2rem] p-6 sm:p-8 md:p-10 relative overflow-hidden">
                  {/* Interior Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-600/[0.03] to-transparent pointer-events-none" />
                  {!submitted ? (
                    <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-[520px]">
                      <div className="flex items-center justify-between mb-10 px-2">
                        {formSteps.map((_, idx) => (
                          <React.Fragment key={idx}>
                            <div className="flex flex-col items-center gap-2">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500",
                                idx <= currentStep
                                  ? "bg-primary-blue text-white shadow-lg shadow-primary-blue/30"
                                  : "bg-white/5 border border-white/10 text-slate-500"
                              )}>
                                {idx + 1}
                              </div>
                            </div>
                            {idx < formSteps.length - 1 && (
                              <div className={cn(
                                "h-px grow mx-4 transition-colors duration-700",
                                idx < currentStep ? "bg-primary-blue" : "bg-white/10"
                              )} />
                            )}
                          </React.Fragment>
                        ))}
                      </div>

                      <div className="mb-8">
                        <div>
                          <h3 className="text-3xl font-black text-white tracking-tight mb-2">
                            {step.title}
                          </h3>
                          <p className="text-slate-400 font-medium">
                            {step.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="grow relative">
                        <div className="space-y-6">
                          {step.fields.map((field) => (
                            <div key={field.key} className="space-y-2">
                              <label className="text-sm font-bold text-slate-300 block ml-1">
                                {field.label} {field.key === "additionalDetails" ? "" : <span className="text-red-400">*</span>}
                              </label>

                              {field.type === "select" ? (
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={() => setOpenSelectKey((prev) => (prev === field.key ? null : field.key))}
                                    className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 px-5 text-left text-sm font-semibold text-white shadow-sm transition-all hover:border-white/30 focus:outline-none focus:ring-4 focus:ring-primary-blue/20"
                                  >
                                    <span className={formData[field.key] ? "text-white" : "text-slate-500"}>
                                      {(formData[field.key] as string) || field.placeholder}
                                    </span>
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500">
                                      <svg className={cn("w-5 h-5 transition-transform", openSelectKey === field.key && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </span>
                                  </button>

                                  {openSelectKey === field.key && (
                                    <>
                                      <div className="fixed inset-0 z-20" onClick={() => setOpenSelectKey(null)} />
                                      <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#18181B] shadow-2xl py-2">
                                        {field.options?.map((opt) => (
                                          <button
                                            key={opt}
                                            type="button"
                                            onClick={() => { handleChange(field.key, opt); setOpenSelectKey(null); }}
                                            className={cn(
                                              "flex w-full px-5 py-3 text-sm font-medium transition-colors",
                                              (formData[field.key] as string) === opt ? "bg-primary-blue/20 text-white" : "text-slate-300 hover:bg-white/5"
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
                                    className="w-full min-h-[56px] py-3 rounded-2xl border border-white/10 bg-white/5 px-5 text-left text-sm font-semibold text-white shadow-sm transition-all hover:border-white/30 focus:outline-none focus:ring-4 focus:ring-primary-blue/20 pr-12 flex flex-wrap gap-2 items-center"
                                  >
                                    {(formData[field.key] as string[]).length > 0 ? (
                                      (formData[field.key] as string[]).map((selected) => (
                                        <div key={selected} className="bg-primary-blue/20 text-zinc-300 px-3 py-1 rounded-full text-xs font-bold border border-primary-blue/30 flex items-center gap-1 z-20">
                                          {selected}
                                          <div
                                            className="w-4 h-4 rounded-full hover:bg-primary-blue/40 inline-flex items-center justify-center cursor-pointer transition-colors"
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
                                      <span className="text-slate-500">{field.placeholder}</span>
                                    )}
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500">
                                      <svg className={cn("w-5 h-5 transition-transform", openSelectKey === field.key && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </span>
                                  </button>

                                  {openSelectKey === field.key && (
                                    <>
                                      <div className="fixed inset-0 z-[19]" onClick={() => setOpenSelectKey(null)} />
                                      <div className="absolute z-[30] mt-2 w-full max-h-[300px] overflow-y-auto rounded-2xl border border-white/10 bg-[#18181B] shadow-2xl py-2">
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
                                                isSelected ? "bg-primary-blue/20 text-white" : "text-slate-300 hover:bg-white/5"
                                              )}
                                            >
                                              <span>{opt}</span>
                                              {isSelected && (
                                                <svg className="w-4 h-4 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
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
                                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-primary-blue/20 focus:border-primary-blue/50 transition-all font-medium min-h-[100px] resize-none"
                                />
                              ) : (
                                <input
                                  type={field.type}
                                  value={formData[field.key] as string}
                                  onChange={(e) => handleChange(field.key, e.target.value)}
                                  placeholder={field.placeholder}
                                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-primary-blue/20 focus:border-primary-blue/50 transition-all font-medium"
                                />
                              )}
                            </div>
                          ))}

                        </div>
                      </div>

                      {error && (
                        <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 shrink-0 uppercase font-black text-[10px]">!</div>
                          <p className="text-sm font-bold text-red-400">{error}</p>
                        </div>
                      )}

                      {submitError && (
                        <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 shrink-0 uppercase font-black text-[10px]">!</div>
                          <p className="text-sm font-bold text-red-400">{submitError}</p>
                        </div>
                      )}

                      <div className="mt-10 flex flex-col gap-4">
                        <div className="flex items-center gap-4 w-full">
                          {currentStep > 0 && (
                            <button
                              type="button"
                              onClick={handleBack}
                              className="h-14 px-8 rounded-2xl font-black text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all tracking-widest uppercase text-xs"
                            >
                              {t("processSteps.back")}
                            </button>
                          )}
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="grow h-14 rounded-2xl bg-white text-[#050510] font-black uppercase tracking-widest text-xs shadow-xl shadow-white/10 transition-all hover:bg-slate-200 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
                          >
                            {isSubmitting && <div className="w-4 h-4 border-2 border-[#050510]/20 border-t-[#050510] rounded-full animate-spin" />}
                            {isSubmitting ? t("processSteps.submitting") : (step.primaryLabel || t("processSteps.nextStepFallback"))}
                          </button>
                        </div>


                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col items-center justify-center min-h-[520px] text-center p-6 lg:p-10">
                      <div className="w-24 h-24 bg-green-500/10 rounded-[2rem] flex items-center justify-center text-green-400 mb-8 shadow-inner border border-green-500/20">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <h3 className="text-4xl font-black text-white mb-4 tracking-tight">{t("processSteps.success.title")}</h3>
                      <p className="text-slate-400 font-medium max-w-sm mx-auto mb-10">
                        {t("processSteps.success.body")}
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <button
                          onClick={() => { setSubmitted(false); setCurrentStep(0); setFormData({ name: "", email: "", message: "", service: [], additionalDetails: "", communicationChannel: "", updateCadence: "", phone: "" }); }}
                          className="flex-1 h-14 rounded-2xl bg-white/5 text-white border border-white/10 font-bold tracking-wide text-sm transition-all hover:bg-white/10"
                        >
                          {t("processSteps.success.newRequest")}
                        </button>
                        <a
                          href={CLIENT_ONBOARDING_URL}
                          className="flex-1 flex items-center justify-center h-14 rounded-2xl bg-white text-[#050510] font-bold tracking-wide text-sm shadow-xl shadow-white/10 transition-all hover:bg-slate-200"
                        >
                          {t("processSteps.success.registerNow")}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="relative lg:pl-10 h-full min-w-0 flex flex-col justify-center lg:order-2">
            <div className="mb-10 min-w-0">
              <h2 className="text-sm font-black text-primary-blue uppercase tracking-[0.2em] mb-4">{t("processSteps.columnTitle")}</h2>
              <SectionTitleHero
                variant={isDark ? "dark" : "light"}
                className="mb-6"
                line1={t("processSteps.columnHeadingLine1", {
                  defaultValue: "Start with ",
                })}
                line2={t("processSteps.columnMid", {
                  defaultValue: "a structured ",
                })}
                highlight={t("processSteps.columnHeadingAccent", {
                  defaultValue: "workspace.",
                })}
              />
              <p className={cn("font-medium leading-relaxed", isDark ? "text-slate-400" : "text-slate-600")}>
                {t("processSteps.columnBody")}
              </p>
            </div>

            <div className="space-y-4 relative">
              {processSteps.map((s, idx) => {
                const isActive = idx === currentStep;
                const isPast = idx < currentStep;

                return (
                  <div
                    key={idx}
                    className={cn(
                      "group relative rounded-3xl p-5 sm:p-6 transition-all duration-500 border min-w-0",
                      isActive
                        ? "bg-white border-slate-200 shadow-xl shadow-slate-200/50 lg:scale-[1.01] z-20"
                        : "bg-slate-100/80 border-slate-200/80 opacity-90 hover:opacity-100 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-start gap-5">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500",
                        isActive ? "bg-primary-blue text-white rotate-3 shadow-lg shadow-primary-blue/40" :
                          isPast ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"
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
                            <span className="flex h-2 w-2 rounded-full bg-primary-blue animate-pulse" />
                          )}
                        </div>
                        {(isActive || isPast) && (
                          <p className="text-sm font-medium text-slate-600 leading-relaxed overflow-hidden">
                            {s.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {isActive && (
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-12 bg-primary-blue rounded-full shadow-[0_0_15px_rgba(37,99,235,0.8)] lg:block hidden" />
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-12 p-8 rounded-[2rem] bg-gradient-to-br from-zinc-50 to-zinc-100/50 border border-zinc-100 text-slate-900 relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-zinc-600 text-xs font-black uppercase tracking-widest mb-2">{t("processSteps.platformPowerLabel")}</p>
                <p className="text-lg font-bold leading-snug text-slate-800">
                  {t("processSteps.platformPowerLine1")} <br />
                  {t("processSteps.platformPowerLine2")}
                </p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-blue/15 rounded-full -mr-16 -mt-16 blur-2xl" />
            </div>

            <div className="mt-6">
              <a
                href={CLIENT_ONBOARDING_URL}
                className="group relative flex w-full items-center justify-center h-16 rounded-[1.5rem] bg-slate-900 border border-slate-800 text-white font-black tracking-wide text-sm transition-all hover:bg-slate-800 hover:border-primary-blue/50 overflow-hidden shadow-lg"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary-blue/10 to-zinc-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 uppercase flex items-center gap-3">
                  {t("processSteps.registerDirectly")}
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProcessStepsSectionDark
