'use client';

import React, { useEffect, useState } from 'react';
import LocalizedLink from '@/components/common/LocalizedLink';
import { format } from 'date-fns';
import { Calendar, ArrowUpRight, Check, X, Star, ChevronDown, RefreshCw, Clock } from 'lucide-react';
import { BlogPost } from '@/utils/blog';
import { cn } from '@/lib/utils';
import { CLIENT_ONBOARDING_URL } from '@/lib/external-links';

// --- Sub-components for better organization ---

const Breadcrumbs = () => (
  <nav className="flex items-center gap-2 text-[13px] text-gray-400 mb-4 md:mb-6">
    <LocalizedLink href="/" className="hover:text-primary-blue transition-colors">A4</LocalizedLink>
    <span className="text-[10px] text-gray-300 mt-0.5">›</span>
    <LocalizedLink href="/insights" className="hover:text-primary-blue transition-colors">Insights</LocalizedLink>
    <span className="text-[10px] text-gray-300 mt-0.5">›</span>
    <span className="text-gray-500">Bookkeeping Software</span>
  </nav>
);

const SoftwareCard = ({
  id, logo, name, tagline, rating, badge, scores, pros, cons, pricing, bestFor, logoBg, badgeClass, isA4 = false
}: any) => (
  <div id={id} className="sw-card opacity-0 translate-y-4 border border-gray-200 rounded-2xl overflow-hidden my-9 transition-all duration-500 hover:shadow-xl hover:shadow-gray-200/50 bg-white">
    <div className="bg-gray-50 p-6 md:p-8 flex flex-col md:flex-row items-start gap-4 md:gap-6 border-b border-gray-200">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-lora text-lg font-bold flex-shrink-0 text-white shadow-sm", logoBg)}>
        {logo}
      </div>
      <div className="flex-1">
        <h3 className="font-lora text-xl md:text-2xl font-bold text-gray-900 mb-1">{name}</h3>
        <p className="text-sm text-gray-500 max-w-2xl">{tagline}</p>
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} fill={i < Math.floor(rating) ? "currentColor" : "none"} strokeWidth={2} />
            ))}
          </div>
          <span className="text-sm font-bold text-gray-900 ml-1">{rating}</span>
          <span className="text-sm text-gray-400">/ 5</span>
        </div>
      </div>
      {badge && (
        <span className={cn("text-[10px] font-bold px-3 py-1.5 rounded-full md:ml-auto flex-shrink-0 mt-2 md:mt-0", badgeClass)}>
          {badge}
        </span>
      )}
    </div>
    <div className="p-6 md:p-8">
      {scores && (
        <div className="mb-8">
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">Scores</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {scores.map((s: any) => (
              <div key={s.label} className="flex flex-col gap-1.5">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{s.label}</span>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="score-fill h-full bg-primary-blue rounded-full transition-all duration-1000 ease-out" style={{ width: '0%' }} data-width={s.value * 10}></div>
                </div>
                <span className="text-xs font-bold text-gray-900">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8">
        <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">Pros & Cons</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
          <div className="flex flex-col gap-3">
            {pros.map((p: string, i: number) => (
              <div key={i} className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
                <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5">
                  <Check size={12} strokeWidth={3} />
                </div>
                {p}
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {cons.map((c: string, i: number) => (
              <div key={i} className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
                <div className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center text-red-500 flex-shrink-0 mt-0.5">
                  <X size={12} strokeWidth={3} />
                </div>
                {c}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Pricing</h4>
          <div className="flex items-baseline gap-2">
            <span className="font-lora text-2xl font-bold text-gray-900">{pricing.main}</span>
            <span className="text-sm text-gray-400">{pricing.note}</span>
          </div>
        </div>
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Best For</h4>
          <div className={cn("p-4 rounded-xl border-l-4 text-sm leading-relaxed", isA4 ? "bg-primary-blue/5 border-primary-blue text-gray-700" : "bg-gray-50 border-gray-200 text-gray-600")}>
            {bestFor}
          </div>
        </div>
      </div>

      {!isA4 && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <LocalizedLink href={`#A4`} className="inline-flex items-center gap-2 text-sm font-bold text-primary-blue hover:gap-3 transition-all">
            See how A4 manages this for you <ArrowUpRight size={16} />
          </LocalizedLink>
        </div>
      )}
    </div>
  </div>
);

export default function BookkeepingContent({ relatedBlogs = [] }: { relatedBlogs?: BlogPost[] }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const prog = document.getElementById('prog');
      if (prog) {
        const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        prog.style.width = pct + '%';
      }

      const tocLinks = document.querySelectorAll('.toc-link');
      const headings: HTMLElement[] = [];
      document.querySelectorAll('h2[id], .sw-card[id], #A4').forEach((h) => {
        headings.push(h as HTMLElement);
      });

      let cur = '';
      headings.forEach((h) => {
        if (h.getBoundingClientRect().top < 160) cur = h.id;
      });
      tocLinks.forEach((l) => {
        l.classList.toggle('active', l.getAttribute('href') === '#' + cur);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const ro = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          e.target.querySelectorAll('.score-fill[data-width]').forEach((bar) => {
            const b = bar as HTMLElement;
            setTimeout(() => { b.style.width = b.dataset.width + '%'; }, 200);
          });
          ro.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.reveal, .sw-card').forEach((el) => { ro.observe(el); });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-primary-blue/10 selection:text-primary-blue">
      {/* Progress Bar */}
      <div id="prog" className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-primary-blue to-emerald-500 z-[999] transition-all duration-100 ease-linear w-0"></div>

      {/* HERO SECTION */}
      <section className="pt-24 md:pt-32 pb-16 border-b border-gray-100">
        <div className="max-w-[1240px] mx-auto px-6 md:px-8">
          <Breadcrumbs />

          <div className="flex flex-wrap items-center gap-3 mb-8">
            <span className="bg-primary-blue/10 text-primary-blue text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md">Software Review</span>
            <div className="w-1 h-1 rounded-full bg-gray-200"></div>
            <span className="text-gray-500 text-[13px]">Updated May 2026</span>
            <div className="w-1 h-1 rounded-full bg-gray-200"></div>
            <span className="text-gray-500 text-[13px] flex items-center gap-1.5"><Clock size={14} /> 11 min read</span>
          </div>

          <h1 className="font-lora text-[clamp(32px,5vw,56px)] font-bold text-gray-900 leading-[1.1] tracking-tight mb-8 max-w-4xl">
            Best Bookkeeping Software for Malta Businesses in 2026 — And Why Software Alone Isn't Enough
          </h1>

          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mb-12">
            Xero, QuickBooks, Sage, FreshBooks, or Wave? We break down the top bookkeeping tools for Malta businesses — and explain what none of them can do on their own.
          </p>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-10 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-blue to-zinc-600 flex items-center justify-center font-lora font-bold text-white">V</div>
              <div>
                <div className="text-sm font-bold text-gray-900">A4 Finance Team</div>
                <div className="text-[13px] text-gray-400">Accounting & Audit Specialists, Malta</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
              <RefreshCw size={14} /> Last updated May 6, 2026
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT LAYOUT */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1240px] mx-auto px-6 md:px-8 flex flex-col lg:grid lg:grid-cols-[1fr_300px] gap-16 md:gap-24 items-start">

          <article className="w-full space-y-12">

            {/* QUICK PICKS */}
            <div className="reveal opacity-0 translate-y-4 bg-gray-50 border border-gray-200 rounded-2xl p-8">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-6">Quick picks — Jump to the one that fits</h4>
              <div className="space-y-3">
                {[
                  { num: 1, name: "QuickBooks Online", tag: "Best overall — used by A4", id: "quickbooks" },
                  { num: 2, name: "Xero", tag: "Best runner-up — A4 integration coming", id: "xero" },
                  { num: 3, name: "Sage Business Cloud", tag: "Best for established businesses", id: "sage" },
                  { num: 4, name: "FreshBooks", tag: "Best for service businesses", id: "freshbooks" },
                  { num: 5, name: "Wave", tag: "Best free option", id: "wave" },
                ].map(pick => (
                  <a key={pick.num} href={`#${pick.id}`} className="flex items-center gap-4 group">
                    <span className="font-lora font-bold text-primary-blue text-sm w-4 shrink-0">{pick.num}</span>
                    <span className="text-sm font-semibold text-gray-900 flex-1 group-hover:text-primary-blue transition-colors">{pick.name}</span>
                    <span className="hidden sm:block text-[11px] text-gray-400 bg-white border border-gray-200 px-3 py-1 rounded-full uppercase tracking-wider font-medium">{pick.tag}</span>
                  </a>
                ))}
                <div className="pt-4 mt-2 border-t border-gray-200 flex items-center gap-4 group">
                  <span className="text-emerald-500 font-bold text-sm w-4 shrink-0">★</span>
                  <LocalizedLink href="#A4" className="text-sm font-bold text-primary-blue flex-1">A4 Managed Service</LocalizedLink>
                  <span className="hidden sm:block text-[11px] text-primary-blue bg-zinc-50 border border-zinc-100 px-3 py-1 rounded-full uppercase tracking-wider font-bold">The Better Way</span>
                </div>
              </div>
            </div>

            <div className="reveal opacity-0 translate-y-4 prose prose-slate max-w-none prose-p:text-gray-600 prose-p:leading-[1.8] prose-p:text-[17px] prose-strong:text-gray-900 prose-strong:font-bold">
              <p>Choosing accounting software for your Malta business is one of the most important operational decisions you'll make. Get it right and your books stay clean, your VAT returns go in on time, and you always know where your business stands financially.</p>
              <p>We've tested every major bookkeeping platform used by Malta businesses and put together an honest breakdown — what each tool does well, where it falls short, and what type of business it's actually built for.</p>
              <p>We've also added one entry that most software comparison articles don't include: the <strong>A4 managed service</strong>, which pairs dedicated Malta accountants with a structured client portal. Because for most business owners, the real problem isn't which software to choose — it's that software requires someone competent to use it.</p>
            </div>

            <section id="what-to-look-for" className="reveal opacity-0 translate-y-4 pt-4">
              <h2 className="font-lora text-3xl font-bold text-gray-900 mb-6">What to Look for in Bookkeeping Software</h2>
              <div className="space-y-6">
                <p className="text-[17px] text-gray-600 leading-[1.8]">Before diving into the reviews, here's what actually matters for a Malta-based business:</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
                  {[
                    { t: "VAT compliance", d: "Support for Malta specific return formats." },
                    { t: "Bank feeds", d: "Direct links to BOV, HSBC Malta, and APS." },
                    { t: "Multi-currency", d: "Essential for international client billing." },
                    { t: "Accountant access", d: "Proper multi-user collaboration tools." },
                    { t: "Reporting quality", d: "Full P&L and Balance Sheet capabilities." },
                    { t: "Scalability", d: "Ability to grow with your company structure." }
                  ].map((item, i) => (
                    <li key={i} className="flex gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="w-6 h-6 rounded-full bg-primary-blue/10 flex items-center justify-center text-primary-blue shrink-0 mt-0.5"><Check size={14} strokeWidth={3} /></div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{item.t}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{item.d}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* CALLOUT AMBER */}
            <div className="reveal opacity-0 translate-y-4 bg-amber-50 border-l-4 border-amber-400 p-6 md:p-8 rounded-r-2xl">
              <div className="flex items-center gap-3 text-amber-800 font-bold mb-3">
                <span className="text-xl">⚠️</span>
                <span className="uppercase tracking-widest text-[11px]">The honest truth about software</span>
              </div>
              <p className="text-amber-900/80 text-[15px] leading-relaxed">
                Every tool on this list can keep your books — in theory. In practice, most business owners lack the time or expertise to use them correctly. Uncategorised transactions, missed reconciliations, and incorrectly filed VAT returns are common with self-managed software. <strong>Software is a tool, not a solution.</strong>
              </p>
            </div>

            {/* QUICKBOOKS */}
            <section id="quickbooks" className="pt-12">
              <h2 className="font-lora text-3xl md:text-4xl font-bold text-gray-900 mb-6">1. QuickBooks Online — Best Overall</h2>
              <div className="reveal opacity-0 translate-y-4 space-y-6">
                <p className="text-[17px] text-gray-600 leading-[1.8]">QuickBooks Online is A4's accounting platform of choice for Malta client engagements. We use it because it offers the most powerful combination of reporting depth, bank integration, VAT compliance, and real-time data.</p>
                <SoftwareCard
                  id="card-qb"
                  name="QuickBooks Online"
                  logo="QB"
                  logoBg="bg-[#2CA01C]"
                  tagline="A4's primary platform — powerful, reliable, and built for growing businesses"
                  rating="4.6"
                  badge="🏆 Top Pick · Used by A4"
                  badgeClass="bg-amber-100 text-amber-800"
                  scores={[
                    { label: "Ease of use", value: 8.5 },
                    { label: "VAT compliance", value: 9.0 },
                    { label: "Reporting", value: 9.4 },
                    { label: "Value", value: 8.2 }
                  ]}
                  pros={[
                    "Platform used by A4 for managed accounts",
                    "Most powerful reporting suite of any SME platform",
                    "Excellent bank feed integration including BOV/HSBC",
                    "Strong VAT return support with Malta compliance"
                  ]}
                  cons={[
                    "Slight learning curve for beginners",
                    "Malta VAT requires initial setup by professional",
                    "Payroll module limited in Malta",
                    "Pricing increases as you scale"
                  ]}
                  pricing={{ main: "From €17/mo", note: "Simple Start plan" }}
                  bestFor="Malta businesses of all sizes who want professional-grade data and reporting. If you work with A4, your books run on QuickBooks."
                />
              </div>
            </section>

            {/* XERO */}
            <section id="xero" className="pt-12">
              <h2 className="font-lora text-3xl md:text-4xl font-bold text-gray-900 mb-6">2. Xero — Strong Runner-Up</h2>

              <div className="reveal opacity-0 translate-y-4 bg-primary-blue rounded-2xl p-8 mb-12 text-white flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-md">
                  <h3 className="font-lora text-2xl font-bold mb-3">A4 × Xero is coming</h3>
                  <p className="text-white/80 text-sm leading-relaxed">We are currently building a direct Xero integration. Connect your Xero account to the A4 portal to see live visibility alongside our services.</p>
                </div>
                <LocalizedLink href="/contact" className="bg-white text-primary-blue px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap hover:bg-white/90 transition-all shrink-0">Notify me when live</LocalizedLink>
              </div>

              <div className="reveal opacity-0 translate-y-4 space-y-6">
                <SoftwareCard
                  id="card-xero"
                  name="Xero"
                  logo="X"
                  logoBg="bg-[#00B5E2]"
                  tagline="Excellent cloud accounting — A4 direct integration arriving soon"
                  rating="4.6"
                  badge="🔗 A4 Integration Coming"
                  badgeClass="bg-zinc-100 text-primary-blue"
                  scores={[
                    { label: "Ease of use", value: 9.2 },
                    { label: "VAT compliance", value: 8.8 },
                    { label: "Reporting", value: 9.0 },
                    { label: "Value", value: 8.2 }
                  ]}
                  pros={[
                    "Cleanest, most intuitive interface",
                    "Excellent bank feed integration for Malta",
                    "Strong VAT return support with EU compliance",
                    "Large app ecosystem (Stripe, HubDoc)"
                  ]}
                  cons={[
                    "Not yet directly integrated with A4 portal",
                    "Payroll module limited in Malta",
                    "Advanced inventory is underpowered",
                    "Support is email/chat only"
                  ]}
                  pricing={{ main: "From €15/mo", note: "Starter plan" }}
                  bestFor="Malta businesses who prefer a clean, design-first interface and want to manage their books with professional assistance."
                />
              </div>
            </section>

            {/* SAGE */}
            <section id="sage" className="pt-12">
              <h2 className="font-lora text-3xl md:text-4xl font-bold text-gray-900 mb-6">3. Sage Business Cloud</h2>
              <SoftwareCard
                id="card-sage"
                name="Sage Business Cloud"
                logo="S"
                logoBg="bg-[#00D639]"
                tagline="Enterprise-grade accounting trusted by established businesses across Europe"
                rating="4.2"
                badge="🏢 Enterprise Preferred"
                badgeClass="bg-gray-100 text-gray-700"
                scores={[
                  { label: "Ease of use", value: 7.0 },
                  { label: "VAT compliance", value: 9.0 },
                  { label: "Reporting", value: 8.8 },
                  { label: "Value", value: 7.2 }
                ]}
                pros={[
                  "Excellent EU and Malta VAT compliance",
                  "Strongest built-in payroll module",
                  "Multi-entity and multi-currency support",
                  "Trusted by auditors for strong audit trails"
                ]}
                cons={[
                  "Steeper learning curve than QBO/Xero",
                  "Interface feels dated and slower",
                  "Fewer third-party app integrations",
                  "Higher price point for full features"
                ]}
                pricing={{ main: "From €25/mo", note: "Accounting Start" }}
                bestFor="Established Malta companies with payroll complexity, multi-entity structures, or high statutory audit requirements."
              />
            </section>

            {/* FRESHBOOKS */}
            <section id="freshbooks" className="pt-12">
              <h2 className="font-lora text-3xl md:text-4xl font-bold text-gray-900 mb-6">4. FreshBooks — Best for Service Businesses</h2>
              <SoftwareCard
                id="card-fresh"
                name="FreshBooks"
                logo="F"
                logoBg="bg-[#1DB954]"
                tagline="Invoicing-first accounting for freelancers, consultants, and service businesses"
                rating="4.1"
                badge="✨ Easiest to Use"
                badgeClass="bg-emerald-50 text-emerald-700"
                scores={[
                  { label: "Ease of use", value: 9.5 },
                  { label: "VAT compliance", value: 7.2 },
                  { label: "Reporting", value: 7.5 },
                  { label: "Value", value: 8.4 }
                ]}
                pros={[
                  "Simplest, most intuitive interface available",
                  "Excellent invoicing and client management",
                  "Time tracking built in — great for consultants",
                  "Good mobile app for receipts on the go"
                ]}
                cons={[
                  "Not built for double-entry accounting — limited for companies",
                  "Weak Malta VAT support — requires workarounds",
                  "No meaningful bank reconciliation workflow",
                  "Not suitable for statutory audit preparation"
                ]}
                pricing={{ main: "From €14/mo", note: "Lite plan" }}
                bestFor="Freelancers, consultants, and very small service businesses in Malta who primarily need invoicing and basic expense tracking."
              />
            </section>

            {/* WAVE */}
            <section id="wave" className="pt-12">
              <h2 className="font-lora text-3xl md:text-4xl font-bold text-gray-900 mb-6">5. Wave — Best Free Option</h2>
              <SoftwareCard
                id="card-wave"
                name="Wave"
                logo="W"
                logoBg="bg-[#71717A]"
                tagline="Free cloud accounting — genuinely useful for the very smallest businesses"
                rating="3.6"
                badge="💰 Free"
                badgeClass="bg-pink-50 text-pink-700"
                pros={[
                  "Completely free for core accounting features",
                  "Decent invoicing and receipt scanning",
                  "Reasonable reports for a free tool"
                ]}
                cons={[
                  "No meaningful Malta VAT support",
                  "No direct bank feeds for Maltese banks",
                  "Limited accountant collaboration",
                  "Not suitable for statutory compliance",
                  "Support is poor — community forum only"
                ]}
                pricing={{ main: "Free", note: "Core accounting" }}
                bestFor="Sole traders and very early-stage Malta businesses who need basic expense tracking and invoicing. Not recommended for limited companies."
              />
            </section>

            {/* MISSING SECTION */}
            <section id="missing" className="reveal opacity-0 translate-y-4 pt-16">
              <h2 className="font-lora text-3xl font-bold text-gray-900 mb-6">What Every Software Option Is Missing</h2>
              <div className="prose prose-slate max-w-none prose-p:text-gray-600 prose-p:leading-[1.8] prose-p:text-[17px] prose-strong:text-gray-900 prose-strong:font-bold">
                <p>Here's the uncomfortable truth about every tool on this list: they are all software. And software does not do your bookkeeping. You do. Or someone competent at your company does. Or you pay an accountant to do it using the software as their tool.</p>
                <p>Most Malta businesses using self-managed accounting software have at least one of these problems:</p>
                <ul className="grid grid-cols-1 gap-2 list-none p-0 mt-6">
                  {[
                    "Transactions categorised incorrectly — sometimes for months",
                    "VAT returns calculated on inaccurate data — leading to penalties",
                    "Bank accounts not reconciled — so cash doesn't match the books",
                    "Management accounts that don't exist — leaving you blind",
                    "Year-end panic when records aren't in order for the auditor"
                  ].map((err, i) => (
                    <li key={i} className="flex gap-4 p-4 bg-red-50/50 rounded-xl border border-red-100/50 text-gray-700 text-[15px]">
                      <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0 mt-0.5"><X size={12} strokeWidth={3} /></div>
                      {err}
                    </li>
                  ))}
                </ul>
                <p className="mt-8">The software isn't the problem. The absence of a competent person maintaining it consistently is.</p>
              </div>
            </section>


            {/* COMPARISON TABLE */}
            <section id="comparison" className="reveal opacity-0 translate-y-4 pt-12">
              <h2 className="font-lora text-3xl font-bold text-gray-900 mb-8">Head-to-Head Comparison</h2>
              <div className="overflow-x-auto -mx-6 px-6 pb-4">
                <table className="w-full border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-900 text-white text-[10px] font-bold uppercase tracking-[0.15em]">
                      <th className="py-4 px-5 text-left rounded-tl-xl">Software</th>
                      <th className="py-4 px-5 text-center">Malta VAT</th>
                      <th className="py-4 px-5 text-center">Bank Feeds</th>
                      <th className="py-4 px-5 text-center">Audit Ready</th>
                      <th className="py-4 px-5 text-center">Payroll</th>
                      <th className="py-4 px-5 text-right rounded-tr-xl">Starting</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {[
                      { name: "QuickBooks", vat: true, bank: true, audit: true, pay: "Add-on", price: "€17/mo", highlight: "★ A4 Pick" },
                      { name: "Xero", vat: true, bank: true, audit: true, pay: "Add-on", price: "€17/mo", highlight: "🔗 Soon" },
                      { name: "Sage", vat: true, bank: true, audit: true, pay: true, price: "€25/mo" },
                      { name: "FreshBooks", vat: "Limited", bank: "Limited", audit: false, pay: false, price: "€14/mo" },
                      { name: "Wave", vat: false, bank: false, audit: false, pay: false, price: "Free" }
                    ].map((row, i) => (
                      <tr key={row.name} className={cn("border-b border-gray-100", i % 2 === 0 ? "bg-white" : "bg-gray-50")}>
                        <td className="py-4 px-5 font-bold text-gray-900">
                          {row.name} {row.highlight && <span className="ml-2 text-[9px] text-primary-blue uppercase tracking-widest">{row.highlight}</span>}
                        </td>
                        <td className="py-4 px-5 text-center">{typeof row.vat === 'boolean' ? (row.vat ? <Check className="mx-auto text-emerald-500" size={16} /> : <X className="mx-auto text-gray-300" size={16} />) : <span className="text-[11px] font-bold text-amber-600">{row.vat}</span>}</td>
                        <td className="py-4 px-5 text-center">{typeof row.bank === 'boolean' ? (row.bank ? <Check className="mx-auto text-emerald-500" size={16} /> : <X className="mx-auto text-gray-300" size={16} />) : <span className="text-[11px] font-bold text-amber-600">{row.bank}</span>}</td>
                        <td className="py-4 px-5 text-center">{row.audit ? <Check className="mx-auto text-emerald-500" size={16} /> : <X className="mx-auto text-gray-300" size={16} />}</td>
                        <td className="py-4 px-5 text-center text-[11px] font-medium text-gray-500">{typeof row.pay === 'boolean' ? (row.pay ? "Built-in" : "N/A") : row.pay}</td>
                        <td className="py-4 px-5 text-right font-bold text-gray-900">{row.price}</td>
                      </tr>
                    ))}
                    <tr className="bg-primary-blue/5 border-b border-primary-blue/20">
                      <td className="py-5 px-5 font-bold text-primary-blue">A4 Accountant</td>
                      <td className="py-5 px-5 text-center"><Check className="mx-auto text-primary-blue" size={18} strokeWidth={3} /></td>
                      <td className="py-5 px-5 text-center"><Check className="mx-auto text-primary-blue" size={18} strokeWidth={3} /></td>
                      <td className="py-5 px-5 text-center"><Check className="mx-auto text-primary-blue" size={18} strokeWidth={3} /></td>
                      <td className="py-5 px-5 text-center font-bold text-primary-blue text-xs">Full Service</td>
                      <td className="py-5 px-5 text-right font-bold text-primary-blue">€79/mo</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* A4 MANAGED SECTION */}
            <section id="A4" className="reveal opacity-0 translate-y-4 py-16">
              <div className="bg-gray-900 rounded-[2rem] p-8 md:p-14 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-blue/20 blur-[100px] pointer-events-none"></div>

                <div className="relative z-10">
                  <span className="text-primary-blue font-bold text-xs uppercase tracking-[0.2em] mb-6 block">★ The Better Model</span>
                  <h2 className="font-lora text-3xl md:text-5xl text-white font-bold leading-tight mb-6">
                    Software + <span className="italic font-normal text-zinc-300">a dedicated team</span> — built for Malta
                  </h2>
                  <p className="text-white/70 text-lg md:text-xl leading-relaxed mb-12 max-w-3xl">
                    A4 isn't bookkeeping software. It's a complete managed accounting service — a dedicated team of Malta-based accountants who handle your books, VAT, and management accounts.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-14">
                    {[
                      "Dedicated Malta accounting team — not a tool",
                      "Automated bank feeds & expert reconciliation",
                      "Full Malta VAT submission handled by us",
                      "Live financial dashboard through A4 portal",
                      "Statutory audit-ready accounts every year",
                      "Expert advisory and growth consulting"
                    ].map((feat, i) => (
                      <div key={i} className="flex gap-4 text-white/90 text-sm font-medium">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5"><Check size={14} strokeWidth={3} /></div>
                        {feat}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <a href={CLIENT_ONBOARDING_URL} className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-base hover:shadow-2xl hover:shadow-white/10 hover:-translate-y-1 transition-all">Get a Managed Quote</a>
                    <LocalizedLink href="/contact" className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-base hover:bg-white/20 transition-all">Talk to a Partner</LocalizedLink>
                  </div>
                </div>
              </div>
            </section>

            {/* VERDICT */}
            <section id="verdict" className="reveal opacity-0 translate-y-4 pb-16">
              <h2 className="font-lora text-3xl font-bold text-gray-900 mb-8">Our Verdict: Which Should You Choose?</h2>
              <div className="space-y-6">
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">If you're choosing software only</h4>
                  <p className="text-[17px] text-gray-600 leading-relaxed">
                    Use <span className="font-bold text-gray-900">QuickBooks Online</span> for most Malta businesses — it's A4's platform of choice, with the best reporting depth and VAT compliance. <span className="font-bold text-gray-900">Xero</span> is an excellent alternative with a cleaner interface, and a A4 direct integration is coming. If you have payroll complexity, look at Sage. If you're a freelancer, FreshBooks is the simplest entry point.
                  </p>
                </div>
                <div className="bg-primary-blue/5 border border-primary-blue/10 rounded-2xl p-8">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary-blue/60 mb-4">If you want your accounting actually handled</h4>
                  <p className="text-[17px] text-gray-600 leading-relaxed">
                    <span className="font-bold text-gray-900">A4</span> is the only option on this list where a qualified team manages everything for you. The portal gives you the visibility you'd get from logging into Xero — without any of the work. For Malta businesses that want clean books, accurate VAT returns, and monthly management accounts without doing it themselves, A4 is the right answer.
                  </p>
                </div>
              </div>
            </section>

            {/* FAQ */}

            <section id="faq" className="reveal opacity-0 translate-y-4 pb-12">
              <h2 className="font-lora text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {[
                  { q: "Which software is best for a new Malta startup?", a: "If you're looking to scale, QuickBooks Online is our top recommendation. It provides the best reporting as you grow. If you're a small freelancer, FreshBooks is easier to start with." },
                  { q: "Do these tools handle Malta VAT returns automatically?", a: "They can calculate the data, but none of them submit the return directly to the Malta CFR portal. You or your accountant must still manually file the return based on the software's figures." },
                  { q: "Can I connect my BOV or HSBC Malta account?", a: "Yes, QuickBooks and Xero both support direct bank feeds for the major Maltese banks. This is a massive time-saver for daily reconciliation." },
                  { q: "Is software enough for statutory audit purposes?", a: "Software is only as good as the records kept in it. For an audit, your records must be consistently reconciled and supported by documentation. Our managed service ensures your books are audit-ready at all times." }
                ].map((faq, i) => (
                  <div key={i} className={cn("border border-gray-200 rounded-xl overflow-hidden transition-all", openFaq === i && "border-primary-blue/30 shadow-lg shadow-primary-blue/5")}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className={cn("w-full flex items-center justify-between p-5 text-left font-bold text-[15px] transition-colors", openFaq === i ? "bg-primary-blue/5 text-primary-blue" : "bg-white text-gray-900 hover:bg-gray-50")}
                    >
                      {faq.q}
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center transition-all", openFaq === i ? "bg-primary-blue text-white rotate-45" : "bg-gray-100 text-gray-400")}>
                        <X size={12} strokeWidth={3} />
                      </div>
                    </button>
                    <div className={cn("overflow-hidden transition-all duration-300 ease-in-out", openFaq === i ? "max-h-[300px]" : "max-h-0")}>
                      <div className="p-6 pt-2 text-[15px] leading-relaxed text-gray-600 border-t border-gray-100/50">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </article>

          {/* SIDEBAR */}
          <aside className="w-full lg:sticky lg:top-24 space-y-8">

            {/* TOC CARD */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm shadow-gray-100/50">
              <h5 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">On this page</h5>
              <nav className="flex flex-col gap-1">
                {[
                  { label: "What to look for", href: "#what-to-look-for", num: "→" },
                  { label: "QuickBooks Online", href: "#quickbooks", num: "1" },
                  { label: "Xero", href: "#xero", num: "2" },
                  { label: "Sage Business Cloud", href: "#sage", num: "3" },
                  { label: "FreshBooks", href: "#freshbooks", num: "4" },
                  { label: "Wave", href: "#wave", num: "5" },
                  { label: "Comparison Table", href: "#comparison", num: "→" },
                  { label: "Missing Logic", href: "#missing", num: "!" },
                  { label: "A4 Model", href: "#A4", num: "★" },
                  { label: "Verdict & FAQs", href: "#faq", num: "→" },

                ].map(item => (
                  <a key={item.href} href={item.href} className="toc-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-primary-blue/5 hover:text-primary-blue transition-all border-l-2 border-transparent [&.active]:bg-primary-blue/5 [&.active]:text-primary-blue [&.active]:border-primary-blue [&.active]:font-bold">
                    <span className="text-[10px] w-4 opacity-50">{item.num}</span>
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* SHARE CARD */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm shadow-gray-100/50">
              <h5 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">Share this review</h5>
              <div className="flex gap-3">
                <button
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-100 rounded-lg text-xs font-bold text-gray-600 hover:border-primary-blue hover:text-primary-blue transition-all"
                >
                  Copy Link
                </button>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://a4.com.mt/insights/bookkeeping')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-100 rounded-lg text-xs font-bold text-gray-600 hover:border-primary-blue hover:text-primary-blue transition-all"
                >
                  LinkedIn
                </a>
              </div>
            </div>

            {/* CTA CARD */}
            <div className="bg-gray-900 rounded-2xl p-6 text-center text-white">
              <h5 className="font-lora text-lg font-bold mb-3 leading-tight">Stop managing software yourself</h5>
              <p className="text-[11px] text-white/60 mb-5 leading-relaxed">Let A4 handle your bookkeeping, VAT, and audit preparation while you focus on growth.</p>
              <a href={CLIENT_ONBOARDING_URL} className="block w-full py-3 bg-primary-blue text-white rounded-xl text-sm font-bold hover:bg-zinc-600 transition-all mb-3">See Managed Pricing</a>
              <span className="text-[10px] text-white/40">Free 30-minute consultation included.</span>
            </div>

          </aside>

        </div>
      </section>

      {/* RELATED BLOGS */}
      {relatedBlogs.length > 0 && (
        <section className="bg-gray-50 py-24 border-t border-gray-200">
          <div className="max-w-[1240px] mx-auto px-6 md:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2 font-lora">
                  Related reading
                </h2>
                <p className="text-gray-500 max-w-xl">
                  Expand your knowledge on Malta's business landscape.
                </p>
              </div>
              <LocalizedLink
                href="/insights"
                className="hidden md:inline-flex items-center gap-2 text-primary-blue font-bold hover:gap-3 transition-all"
              >
                View all insights
                <ArrowUpRight className="w-5 h-5" />
              </LocalizedLink>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedBlogs.map((relatedBlog) => (
                <article
                  key={relatedBlog.slug}
                  className="group relative flex flex-col h-full bg-white hover:bg-primary-blue rounded-3xl border border-gray-100 hover:border-primary-blue transition-all duration-500 hover:shadow-2xl hover:shadow-primary-blue/20"
                >
                  <LocalizedLink href={`/insights/${relatedBlog.slug}`} className="flex flex-col h-full p-6 md:p-8">
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary-blue/5 text-primary-blue group-hover:bg-white/20 group-hover:text-white transition-colors duration-300">
                        {relatedBlog.tags ? relatedBlog.tags[0] : 'Insight'}
                      </span>
                      <div className="flex items-center text-xs text-gray-400 group-hover:text-white/70 transition-colors duration-300">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        {format(new Date(relatedBlog.date), 'MMM dd, yyyy')}
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-white transition-colors duration-300 line-clamp-2 font-lora">
                      {relatedBlog.title}
                    </h3>

                    <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-2 group-hover:text-white/80 transition-colors duration-300">
                      {relatedBlog.excerpt}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-50 group-hover:border-white/10 transition-colors duration-300">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 group-hover:text-white transition-colors duration-300">{relatedBlog.author}</span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors duration-300">
                        <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-primary-blue transition-colors duration-300" />
                      </div>
                    </div>
                  </LocalizedLink>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Global CSS for scroll reveal and custom TOC active state */}
      <style jsx global>{`
        .reveal.in, .sw-card.in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        .toc-link.active {
          background-color: rgb(238 244 255) !important;
          color: rgb(27 92 232) !important;
          border-left-color: rgb(27 92 232) !important;
          font-weight: 700 !important;
        }
        .toc-link.active span {
          color: rgb(27 92 232) !important;
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
