'use client';

import React, { useEffect, useState } from 'react';
import LocalizedLink from '@/components/common/LocalizedLink';
import { format } from 'date-fns';
import { BlogPost } from '@/utils/blog';
import { CLIENT_ONBOARDING_URL } from '@/lib/external-links';
import { BOOKKEEPING_FROM } from '@/data/a4QuotePack';
import { Icon } from '@/components/a4-landing/Primitives';
import { A4Mark, DARK_CARD, DARK_GRID, DriftGlow, GRAD, MUTED_GLOW, Slab, TypeText, gradText } from '@/components/fx/primitives';

const SANS = 'var(--a4x-display)';
const BODY = 'var(--a4x-body)';
const INDIGO = '#4F55F1';
const PERI = '#8B8FF7';
const INK = '#09090B';

const kicker: React.CSSProperties = { fontFamily: BODY, fontSize: 12, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: '#71717A' };
const h2Style: React.CSSProperties = { margin: '0 0 22px', fontFamily: SANS, fontSize: 'clamp(30px,3.2vw,44px)', fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1.06, color: INK, scrollMarginTop: 96, textWrap: 'balance' };
const prose: React.CSSProperties = { margin: '0 0 1.2em', fontFamily: BODY, fontSize: 17.5, lineHeight: 1.75, color: '#3F3F46' };
const strong: React.CSSProperties = { color: INK, fontWeight: 600 };

// --- Sub-components for better organization ---

const Breadcrumbs = () => (
  <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, fontFamily: SANS, fontSize: 15, fontWeight: 500, color: '#A1A1AA' }}>
    <LocalizedLink href="/" className="cp-focus" style={{ color: '#A1A1AA', textDecoration: 'none' }}>A4</LocalizedLink>
    <span aria-hidden="true" style={{ color: '#52525B' }}>›</span>
    <LocalizedLink href="/insights" className="cp-focus" style={{ color: '#A1A1AA', textDecoration: 'none' }}>Insights</LocalizedLink>
    <span aria-hidden="true" style={{ color: '#52525B' }}>›</span>
    <span style={{ color: PERI }}>Bookkeeping Software</span>
  </nav>
);

type Score = { label: string; value: number };

type SoftwareCardProps = {
  id: string;
  logo: string;
  name: string;
  tagline: string;
  rating: string;
  badge?: string;
  scores?: Score[];
  pros: string[];
  cons: string[];
  pricing: { main: string; note: string };
  bestFor: string;
  isA4?: boolean;
};

const Stars = ({ rating }: { rating: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }} aria-label={`${rating} out of 5`}>
    {[...Array(5)].map((_, i) => (
      <svg key={i} viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill={i < Math.floor(Number(rating)) ? INDIGO : 'none'} stroke={INDIGO} strokeWidth={2} strokeLinejoin="round">
        <path d="M12 2.8l2.85 5.78 6.38.93-4.62 4.5 1.09 6.35L12 17.36l-5.7 3 1.09-6.35-4.62-4.5 6.38-.93z" />
      </svg>
    ))}
  </div>
);

/** A product review as the design's document panel: header, scores, pros & cons, pricing. */
const SoftwareCard = ({ id, logo, name, tagline, rating, badge, scores, pros, cons, pricing, bestFor, isA4 = false }: SoftwareCardProps) => (
  <div
    id={id}
    data-fx="rise"
    data-dy="70"
    className="sw-card"
    style={{ margin: '36px 0', background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: 28, overflow: 'hidden', boxShadow: '0 40px 100px rgba(9,9,11,.08)', scrollMarginTop: 96 }}
  >
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '16px 20px', padding: 'clamp(22px,3vw,32px)', background: '#FAFAFA', borderBottom: '1px solid #E4E4E7' }}>
      <div
        aria-hidden="true"
        style={{ width: 56, height: 56, flexShrink: 0, borderRadius: 16, display: 'grid', placeItems: 'center', background: INK, color: '#FFFFFF', fontFamily: SANS, fontSize: 19, fontWeight: 600, letterSpacing: '-0.02em' }}
      >
        {logo}
      </div>
      <div style={{ flex: '1 1 260px', minWidth: 0 }}>
        <h3 style={{ margin: 0, fontFamily: SANS, fontSize: 'clamp(24px,2.4vw,30px)', fontWeight: 600, letterSpacing: '-0.035em', lineHeight: 1.1, color: INK }}>{name}</h3>
        <p style={{ margin: '6px 0 0', fontFamily: BODY, fontSize: 15, lineHeight: 1.5, color: '#52525B' }}>{tagline}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
          <Stars rating={rating} />
          <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: INK }}>{rating}</span>
          <span style={{ fontFamily: BODY, fontSize: 14, color: '#71717A' }}>/ 5</span>
        </div>
      </div>
      {badge && (
        <span style={{ flexShrink: 0, height: 32, padding: '0 14px', display: 'inline-flex', alignItems: 'center', borderRadius: 999, background: 'rgba(79,85,241,.1)', color: INDIGO, fontFamily: SANS, fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
          {badge}
        </span>
      )}
    </div>
    <div style={{ padding: 'clamp(22px,3vw,32px)' }}>
      {scores && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ ...kicker, marginBottom: 16 }}>Scores</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '18px 24px' }}>
            {scores.map((s) => (
              <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontFamily: BODY, fontSize: 13, fontWeight: 500, color: '#52525B' }}>{s.label}</span>
                {/* The bar fills with scroll (the design's timeline fill). */}
                <div data-tl="" style={{ position: 'relative', height: 6, borderRadius: 3, background: '#F4F4F5', overflow: 'hidden' }}>
                  <div data-tl-fill="" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${s.value * 10}%`, borderRadius: 3, background: GRAD }} />
                </div>
                <span style={{ fontFamily: SANS, fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em', color: INK }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 32 }}>
        <div style={{ ...kicker, marginBottom: 16 }}>Pros &amp; Cons</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '14px 40px' }}>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pros.map((p, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontFamily: BODY, fontSize: 15, lineHeight: 1.55, color: '#3F3F46' }}>
                <span aria-hidden="true" style={{ width: 22, height: 22, flexShrink: 0, marginTop: 1, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'rgba(79,85,241,.1)' }}>
                  <Icon name="check" size={13} color={INDIGO} stroke={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {cons.map((c, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontFamily: BODY, fontSize: 15, lineHeight: 1.55, color: '#3F3F46' }}>
                <span aria-hidden="true" style={{ width: 22, height: 22, flexShrink: 0, marginTop: 1, borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#F4F4F5' }}>
                  <Icon name="x" size={13} color="#71717A" stroke={3} />
                </span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '24px 32px', alignItems: 'end' }}>
        <div>
          <div style={{ ...kicker, marginBottom: 10 }}>Pricing</div>
          <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontFamily: SANS, fontSize: 30, fontWeight: 600, letterSpacing: '-0.035em', color: INK }}>{pricing.main}</span>
            <span style={{ fontFamily: BODY, fontSize: 14, color: '#71717A' }}>{pricing.note}</span>
          </div>
        </div>
        <div>
          <div style={{ ...kicker, marginBottom: 10 }}>Best For</div>
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 16,
              borderLeft: `3px solid ${isA4 ? INDIGO : '#E4E4E7'}`,
              background: isA4 ? 'rgba(79,85,241,.06)' : '#FAFAFA',
              fontFamily: BODY,
              fontSize: 14.5,
              lineHeight: 1.55,
              color: '#3F3F46',
            }}
          >
            {bestFor}
          </div>
        </div>
      </div>

      {!isA4 && (
        <div style={{ marginTop: 28, paddingTop: 22, borderTop: '1px solid #E4E4E7' }}>
          <LocalizedLink href={`#A4`} className="cp-link cp-focus">
            See how A4 manages this for you <Icon name="arrow-up-right" size={17} color={INDIGO} />
          </LocalizedLink>
        </div>
      )}
    </div>
  </div>
);

const QUICK_PICKS = [
  { num: 1, name: "QuickBooks Online", tag: "Best overall — used by A4", id: "quickbooks" },
  { num: 2, name: "Xero", tag: "Best runner-up — A4 integration coming", id: "xero" },
  { num: 3, name: "Sage Business Cloud", tag: "Best for established businesses", id: "sage" },
  { num: 4, name: "FreshBooks", tag: "Best for service businesses", id: "freshbooks" },
  { num: 5, name: "Wave", tag: "Best free option", id: "wave" },
];

const LOOK_FOR = [
  { t: "VAT compliance", d: "Support for Malta specific return formats." },
  { t: "Bank feeds", d: "Direct links to BOV, HSBC Malta, and APS." },
  { t: "Multi-currency", d: "Essential for international client billing." },
  { t: "Accountant access", d: "Proper multi-user collaboration tools." },
  { t: "Reporting quality", d: "Full P&L and Balance Sheet capabilities." },
  { t: "Scalability", d: "Ability to grow with your company structure." },
];

const MISSING = [
  "Transactions categorised incorrectly — sometimes for months",
  "VAT returns calculated on inaccurate data — leading to penalties",
  "Bank accounts not reconciled — so cash doesn't match the books",
  "Management accounts that don't exist — leaving you blind",
  "Year-end panic when records aren't in order for the auditor",
];

const COMPARE: { name: string; vat: boolean | string; bank: boolean | string; audit: boolean; pay: boolean | string; price: string; highlight?: string }[] = [
  { name: "QuickBooks", vat: true, bank: true, audit: true, pay: "Add-on", price: "€17/mo", highlight: "★ A4 Pick" },
  { name: "Xero", vat: true, bank: true, audit: true, pay: "Add-on", price: "€17/mo", highlight: "Soon" },
  { name: "Sage", vat: true, bank: true, audit: true, pay: true, price: "€25/mo" },
  { name: "FreshBooks", vat: "Limited", bank: "Limited", audit: false, pay: false, price: "€14/mo" },
  { name: "Wave", vat: false, bank: false, audit: false, pay: false, price: "Free" },
];

const MANAGED_FEATURES = [
  "Dedicated Malta accounting team — not a tool",
  "Automated bank feeds & expert reconciliation",
  "Full Malta VAT submission handled by us",
  "Live financial dashboard through A4 portal",
  "Statutory audit-ready accounts every year",
  "Expert advisory and growth consulting",
];

const FAQS = [
  { q: "Which software is best for a new Malta startup?", a: "If you're looking to scale, QuickBooks Online is our top recommendation. It provides the best reporting as you grow. If you're a small freelancer, FreshBooks is easier to start with." },
  { q: "Do these tools handle Malta VAT returns automatically?", a: "They can calculate the data, but none of them submit the return directly to the Malta CFR portal. You or your accountant must still manually file the return based on the software's figures." },
  { q: "Can I connect my BOV or HSBC Malta account?", a: "Yes, QuickBooks and Xero both support direct bank feeds for the major Maltese banks. This is a massive time-saver for daily reconciliation." },
  { q: "Is software enough for statutory audit purposes?", a: "Software is only as good as the records kept in it. For an audit, your records must be consistently reconciled and supported by documentation. Our managed service ensures your books are audit-ready at all times." },
];

const TOC = [
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
];

function Cell({ v }: { v: boolean | string }) {
  if (typeof v === 'boolean') {
    return v ? (
      <span style={{ display: 'inline-flex' }} aria-label="Yes">
        <Icon name="check" size={17} color={INDIGO} stroke={2.6} />
      </span>
    ) : (
      <span style={{ display: 'inline-flex' }} aria-label="No">
        <Icon name="x" size={16} color="#A1A1AA" stroke={2.4} />
      </span>
    );
  }
  return <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: '#52525B' }}>{v}</span>;
}

export default function BookkeepingContent({ relatedBlogs = [] }: { relatedBlogs?: BlogPost[] }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Reading progress and the table-of-contents highlight follow the scroll.
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
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const tdBase: React.CSSProperties = { padding: '16px 18px', textAlign: 'center', borderBottom: '1px solid #E4E4E7' };

  return (
    <div className="a4-site-page" style={{ background: '#FFFFFF' }}>
      {/* Progress Bar */}
      <div id="prog" style={{ position: 'fixed', top: 0, left: 0, height: 3, width: 0, zIndex: 999, background: GRAD, transition: 'width .1s linear' }} />

      {/* HERO */}
      <section data-hero="" style={{ position: 'relative', overflow: 'hidden', color: '#FFFFFF', background: DARK_GRID }}>
        <DriftGlow left="28%" top="-30%" strength={0.28} />
        <div data-hero-par="" aria-hidden="true" style={{ position: 'absolute', right: '-20vw', top: '12vh', width: '44vw', height: '90vh', pointerEvents: 'none' }}>
          <div data-fx="slab" data-d="80" style={{ position: 'absolute', inset: 0 }}>
            <Slab opacity={0.42} />
          </div>
        </div>
        <div
          data-hero-exit=""
          style={{ position: 'relative', zIndex: 2, maxWidth: 1280, margin: '0 auto', padding: 'clamp(128px,14vw,168px) clamp(20px,5vw,72px) clamp(72px,8vw,112px)', display: 'flex', flexDirection: 'column', gap: 'clamp(22px,2.6vw,32px)' }}
        >
          <div data-fx="rise" data-d="60">
            <Breadcrumbs />
          </div>
          <div data-fx="rise" data-d="140" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
            <span className="a4-chip a4-chip-dark" style={{ color: '#FFFFFF', borderColor: 'rgba(139,143,247,.45)', background: 'rgba(139,143,247,.14)' }}>Software Review</span>
            <span className="a4-chip a4-chip-dark">Updated May 2026</span>
            <span className="a4-chip a4-chip-dark">
              <Icon name="clock" size={15} color="#A1A1AA" /> 11 min read
            </span>
          </div>

          <h1 style={{ margin: 0, maxWidth: 1180, fontFamily: SANS, fontSize: 'clamp(34px,4.2vw,64px)', fontWeight: 500, letterSpacing: '-0.035em', lineHeight: 1.06 }}>
            <TypeText as="span" segments={[{ t: 'Best Bookkeeping Software for Malta Businesses in 2026 —', c: '#FFFFFF' }]} per={24} d={240} style={{ display: 'block' }} />
            <span data-fx="rise" data-d="1700" data-dy="50" style={{ display: 'block', fontWeight: 600, paddingBottom: '.06em', ...gradText }}>
              And Why Software Alone Isn&apos;t Enough
            </span>
          </h1>

          <p data-fx="rise" data-d="1900" style={{ margin: 0, maxWidth: 780, fontFamily: SANS, fontSize: 'clamp(18px,1.7vw,24px)', fontWeight: 500, letterSpacing: '-0.015em', lineHeight: 1.45, color: '#A1A1AA', textWrap: 'pretty' }}>
            Xero, QuickBooks, Sage, FreshBooks, or Wave? We break down the top bookkeeping tools for Malta businesses — and explain what none of them can do on their own.
          </p>

          <div
            data-fx="rise"
            data-d="2050"
            style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,.1)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span aria-hidden="true" style={{ width: 46, height: 46, borderRadius: '50%', display: 'grid', placeItems: 'center', border: '1px solid rgba(255,255,255,.18)', background: 'rgba(255,255,255,.06)' }}>
                <A4Mark size={20} />
              </span>
              <div>
                <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 600 }}>A4 Finance Team</div>
                <div style={{ fontFamily: BODY, fontSize: 13.5, color: '#A1A1AA' }}>Accounting &amp; Audit Specialists, Malta</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: BODY, fontSize: 13.5, color: '#A1A1AA' }}>
              <Icon name="refresh-cw" size={15} color="#A1A1AA" /> Last updated May 6, 2026
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT LAYOUT */}
      <section style={{ position: 'relative', padding: 'clamp(72px,9vw,128px) clamp(20px,5vw,72px)', background: '#FFFFFF', color: INK }}>
        <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_300px] items-start" style={{ maxWidth: 1280, margin: '0 auto', gap: 'clamp(56px,6vw,96px)' }}>
          <article style={{ width: '100%', minWidth: 0 }}>
            {/* QUICK PICKS */}
            <div data-fx="rise" style={{ padding: 'clamp(22px,3vw,32px)', borderRadius: 24, border: '1px solid #E4E4E7', background: '#FAFAFA' }}>
              <div style={{ ...kicker, marginBottom: 14 }}>Quick picks — Jump to the one that fits</div>
              <div>
                {QUICK_PICKS.map((pick) => (
                  <a
                    key={pick.num}
                    href={`#${pick.id}`}
                    className="cp-focus"
                    style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '13px 0', borderTop: '1px solid #E4E4E7', textDecoration: 'none' }}
                  >
                    <span style={{ width: 28, flexShrink: 0, fontFamily: SANS, fontSize: 15, fontWeight: 600, color: INDIGO }}>{String(pick.num).padStart(2, '0')}</span>
                    <span style={{ flex: 1, fontFamily: SANS, fontSize: 17.5, fontWeight: 500, letterSpacing: '-0.015em', color: INK }}>{pick.name}</span>
                    <span className="hidden sm:inline-flex" style={{ height: 28, padding: '0 12px', alignItems: 'center', borderRadius: 999, border: '1px solid #E4E4E7', background: '#FFFFFF', fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: '#52525B', whiteSpace: 'nowrap' }}>
                      {pick.tag}
                    </span>
                  </a>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '15px 0 2px', borderTop: '1px solid #E4E4E7' }}>
                  <span style={{ width: 28, flexShrink: 0, fontFamily: SANS, fontSize: 15, fontWeight: 600, color: INDIGO }}>★</span>
                  <LocalizedLink href="#A4" style={{ flex: 1, fontFamily: SANS, fontSize: 17.5, fontWeight: 600, letterSpacing: '-0.015em', color: INDIGO, textDecoration: 'none' }}>
                    A4 Managed Service
                  </LocalizedLink>
                  <span className="hidden sm:inline-flex" style={{ height: 28, padding: '0 12px', alignItems: 'center', borderRadius: 999, background: INK, fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap' }}>
                    The Better Way
                  </span>
                </div>
              </div>
            </div>

            <div data-fx="rise" style={{ marginTop: 44 }}>
              <p style={prose}>Choosing accounting software for your Malta business is one of the most important operational decisions you&apos;ll make. Get it right and your books stay clean, your VAT returns go in on time, and you always know where your business stands financially.</p>
              <p style={prose}>We&apos;ve tested every major bookkeeping platform used by Malta businesses and put together an honest breakdown — what each tool does well, where it falls short, and what type of business it&apos;s actually built for.</p>
              <p style={prose}>We&apos;ve also added one entry that most software comparison articles don&apos;t include: the <strong style={strong}>A4 managed service</strong>, which pairs dedicated Malta accountants with a structured client portal. Because for most business owners, the real problem isn&apos;t which software to choose — it&apos;s that software requires someone competent to use it.</p>
            </div>

            <section id="what-to-look-for" data-fx="rise" style={{ marginTop: 56, scrollMarginTop: 96 }}>
              <h2 style={h2Style}>What to Look for in Bookkeeping Software</h2>
              <p style={prose}>Before diving into the reviews, here&apos;s what actually matters for a Malta-based business:</p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 12 }}>
                {LOOK_FOR.map((item, i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, padding: '18px 20px', borderRadius: 20, border: '1px solid #E4E4E7', background: '#FFFFFF' }}>
                    <span className="a4-bullet" />
                    <div>
                      <div style={{ fontFamily: SANS, fontSize: 17, fontWeight: 600, letterSpacing: '-0.015em', color: INK }}>{item.t}</div>
                      <div style={{ marginTop: 3, fontFamily: BODY, fontSize: 14, lineHeight: 1.5, color: '#52525B' }}>{item.d}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* CALLOUT */}
            <div data-fx="rise" className="cp-card cp-dark cp-static" style={{ marginTop: 44, padding: 'clamp(24px,3vw,32px)' }}>
              <div className="a4-eyebrow" style={{ color: PERI, fontSize: 16 }}>
                <span aria-hidden="true" style={{ display: 'inline-block', width: 9, height: 9, borderRadius: 1, background: PERI, transform: 'skewX(-30deg)', alignSelf: 'center' }} />
                <span>The honest truth about software</span>
              </div>
              <p style={{ margin: '14px 0 0', fontFamily: BODY, fontSize: 16, lineHeight: 1.65, color: '#D4D4D8' }}>
                Every tool on this list can keep your books — in theory. In practice, most business owners lack the time or expertise to use them correctly. Uncategorised transactions, missed reconciliations, and incorrectly filed VAT returns are common with self-managed software. <strong style={{ color: '#FFFFFF', fontWeight: 600 }}>Software is a tool, not a solution.</strong>
              </p>
            </div>

            {/* QUICKBOOKS */}
            <section id="quickbooks" style={{ marginTop: 72, scrollMarginTop: 96 }}>
              <h2 data-fx="rise" style={h2Style}>1. QuickBooks Online — Best Overall</h2>
              <p data-fx="rise" style={prose}>QuickBooks Online is A4&apos;s accounting platform of choice for Malta client engagements. We use it because it offers the most powerful combination of reporting depth, bank integration, VAT compliance, and real-time data.</p>
              <SoftwareCard
                id="card-qb"
                name="QuickBooks Online"
                logo="QB"
                tagline="A4's primary platform — powerful, reliable, and built for growing businesses"
                rating="4.6"
                badge="Top Pick · Used by A4"
                scores={[
                  { label: "Ease of use", value: 8.5 },
                  { label: "VAT compliance", value: 9.0 },
                  { label: "Reporting", value: 9.4 },
                  { label: "Value", value: 8.2 },
                ]}
                pros={[
                  "Platform used by A4 for managed accounts",
                  "Most powerful reporting suite of any SME platform",
                  "Excellent bank feed integration including BOV/HSBC",
                  "Strong VAT return support with Malta compliance",
                ]}
                cons={[
                  "Slight learning curve for beginners",
                  "Malta VAT requires initial setup by professional",
                  "Payroll module limited in Malta",
                  "Pricing increases as you scale",
                ]}
                pricing={{ main: "From €17/mo", note: "Simple Start plan" }}
                bestFor="Malta businesses of all sizes who want professional-grade data and reporting. If you work with A4, your books run on QuickBooks."
              />
            </section>

            {/* XERO */}
            <section id="xero" style={{ marginTop: 72, scrollMarginTop: 96 }}>
              <h2 data-fx="rise" style={h2Style}>2. Xero — Strong Runner-Up</h2>

              <div
                data-fx="rise"
                style={{ position: 'relative', overflow: 'hidden', marginBottom: 36, padding: 'clamp(24px,3.4vw,36px)', borderRadius: 24, background: DARK_CARD, border: '1px solid rgba(255,255,255,.08)', color: '#FFFFFF', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}
              >
                <div style={{ maxWidth: 460 }}>
                  <h3 style={{ margin: 0, fontFamily: SANS, fontSize: 'clamp(24px,2.4vw,30px)', fontWeight: 600, letterSpacing: '-0.035em' }}>A4 × Xero is coming</h3>
                  <p style={{ margin: '10px 0 0', fontFamily: BODY, fontSize: 15, lineHeight: 1.6, color: '#A1A1AA' }}>We are currently building a direct Xero integration. Connect your Xero account to the A4 portal to see live visibility alongside our services.</p>
                </div>
                <LocalizedLink href="/contact" className="a4-btn a4-btn-light" style={{ height: 48, padding: '0 22px', fontSize: 16, textDecoration: 'none' }}>
                  Notify me when live
                </LocalizedLink>
              </div>

              <SoftwareCard
                id="card-xero"
                name="Xero"
                logo="X"
                tagline="Excellent cloud accounting — A4 direct integration arriving soon"
                rating="4.6"
                badge="A4 Integration Coming"
                scores={[
                  { label: "Ease of use", value: 9.2 },
                  { label: "VAT compliance", value: 8.8 },
                  { label: "Reporting", value: 9.0 },
                  { label: "Value", value: 8.2 },
                ]}
                pros={[
                  "Cleanest, most intuitive interface",
                  "Excellent bank feed integration for Malta",
                  "Strong VAT return support with EU compliance",
                  "Large app ecosystem (Stripe, HubDoc)",
                ]}
                cons={[
                  "Not yet directly integrated with A4 portal",
                  "Payroll module limited in Malta",
                  "Advanced inventory is underpowered",
                  "Support is email/chat only",
                ]}
                pricing={{ main: "From €15/mo", note: "Starter plan" }}
                bestFor="Malta businesses who prefer a clean, design-first interface and want to manage their books with professional assistance."
              />
            </section>

            {/* SAGE */}
            <section id="sage" style={{ marginTop: 72, scrollMarginTop: 96 }}>
              <h2 data-fx="rise" style={h2Style}>3. Sage Business Cloud</h2>
              <SoftwareCard
                id="card-sage"
                name="Sage Business Cloud"
                logo="S"
                tagline="Enterprise-grade accounting trusted by established businesses across Europe"
                rating="4.2"
                badge="Enterprise Preferred"
                scores={[
                  { label: "Ease of use", value: 7.0 },
                  { label: "VAT compliance", value: 9.0 },
                  { label: "Reporting", value: 8.8 },
                  { label: "Value", value: 7.2 },
                ]}
                pros={[
                  "Excellent EU and Malta VAT compliance",
                  "Strongest built-in payroll module",
                  "Multi-entity and multi-currency support",
                  "Trusted by auditors for strong audit trails",
                ]}
                cons={[
                  "Steeper learning curve than QBO/Xero",
                  "Interface feels dated and slower",
                  "Fewer third-party app integrations",
                  "Higher price point for full features",
                ]}
                pricing={{ main: "From €25/mo", note: "Accounting Start" }}
                bestFor="Established Malta companies with payroll complexity, multi-entity structures, or high statutory audit requirements."
              />
            </section>

            {/* FRESHBOOKS */}
            <section id="freshbooks" style={{ marginTop: 72, scrollMarginTop: 96 }}>
              <h2 data-fx="rise" style={h2Style}>4. FreshBooks — Best for Service Businesses</h2>
              <SoftwareCard
                id="card-fresh"
                name="FreshBooks"
                logo="F"
                tagline="Invoicing-first accounting for freelancers, consultants, and service businesses"
                rating="4.1"
                badge="Easiest to Use"
                scores={[
                  { label: "Ease of use", value: 9.5 },
                  { label: "VAT compliance", value: 7.2 },
                  { label: "Reporting", value: 7.5 },
                  { label: "Value", value: 8.4 },
                ]}
                pros={[
                  "Simplest, most intuitive interface available",
                  "Excellent invoicing and client management",
                  "Time tracking built in — great for consultants",
                  "Good mobile app for receipts on the go",
                ]}
                cons={[
                  "Not built for double-entry accounting — limited for companies",
                  "Weak Malta VAT support — requires workarounds",
                  "No meaningful bank reconciliation workflow",
                  "Not suitable for statutory audit preparation",
                ]}
                pricing={{ main: "From €14/mo", note: "Lite plan" }}
                bestFor="Freelancers, consultants, and very small service businesses in Malta who primarily need invoicing and basic expense tracking."
              />
            </section>

            {/* WAVE */}
            <section id="wave" style={{ marginTop: 72, scrollMarginTop: 96 }}>
              <h2 data-fx="rise" style={h2Style}>5. Wave — Best Free Option</h2>
              <SoftwareCard
                id="card-wave"
                name="Wave"
                logo="W"
                tagline="Free cloud accounting — genuinely useful for the very smallest businesses"
                rating="3.6"
                badge="Free"
                pros={[
                  "Completely free for core accounting features",
                  "Decent invoicing and receipt scanning",
                  "Reasonable reports for a free tool",
                ]}
                cons={[
                  "No meaningful Malta VAT support",
                  "No direct bank feeds for Maltese banks",
                  "Limited accountant collaboration",
                  "Not suitable for statutory compliance",
                  "Support is poor — community forum only",
                ]}
                pricing={{ main: "Free", note: "Core accounting" }}
                bestFor="Sole traders and very early-stage Malta businesses who need basic expense tracking and invoicing. Not recommended for limited companies."
              />
            </section>

            {/* MISSING SECTION */}
            <section id="missing" data-fx="rise" style={{ marginTop: 80, scrollMarginTop: 96 }}>
              <h2 style={h2Style}>What Every Software Option Is Missing</h2>
              <p style={prose}>Here&apos;s the uncomfortable truth about every tool on this list: they are all software. And software does not do your bookkeeping. You do. Or someone competent at your company does. Or you pay an accountant to do it using the software as their tool.</p>
              <p style={prose}>Most Malta businesses using self-managed accounting software have at least one of these problems:</p>
              <ol style={{ margin: '8px 0 0', padding: 0, listStyle: 'none' }}>
                {MISSING.map((err, i) => (
                  <li
                    key={i}
                    style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 12, padding: '18px 0', borderTop: '1px solid #E4E4E7', ...(i === MISSING.length - 1 ? { borderBottom: '1px solid #E4E4E7' } : null) }}
                  >
                    <span style={{ paddingTop: 2, fontFamily: SANS, fontSize: 15, fontWeight: 600, color: INDIGO }}>{String(i + 1).padStart(2, '0')}</span>
                    <span style={{ fontFamily: SANS, fontSize: 18, fontWeight: 500, letterSpacing: '-0.015em', lineHeight: 1.4, color: INK }}>{err}</span>
                  </li>
                ))}
              </ol>
              <p style={{ ...prose, marginTop: 28 }}>The software isn&apos;t the problem. The absence of a competent person maintaining it consistently is.</p>
            </section>

            {/* COMPARISON TABLE */}
            <section id="comparison" data-fx="rise" style={{ marginTop: 72, scrollMarginTop: 96 }}>
              <h2 style={h2Style}>Head-to-Head Comparison</h2>
              <div style={{ overflowX: 'auto', borderRadius: 24, border: '1px solid #E4E4E7' }}>
                <table style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: INK }}>
                      {['Software', 'Malta VAT', 'Bank Feeds', 'Audit Ready', 'Payroll', 'Starting'].map((h, i) => (
                        <th
                          key={h}
                          style={{ ...kicker, color: '#E4E4E7', padding: '16px 18px', textAlign: i === 0 ? 'left' : i === 5 ? 'right' : 'center' }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARE.map((row, i) => (
                      <tr key={row.name} style={{ background: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                        <td style={{ ...tdBase, textAlign: 'left', fontFamily: SANS, fontSize: 16, fontWeight: 600, color: INK, whiteSpace: 'nowrap' }}>
                          {row.name}
                          {row.highlight && (
                            <span style={{ marginLeft: 10, fontFamily: SANS, fontSize: 11.5, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: INDIGO }}>{row.highlight}</span>
                          )}
                        </td>
                        <td style={tdBase}><Cell v={row.vat} /></td>
                        <td style={tdBase}><Cell v={row.bank} /></td>
                        <td style={tdBase}><Cell v={row.audit} /></td>
                        <td style={{ ...tdBase, fontFamily: SANS, fontSize: 13, fontWeight: 500, color: '#52525B' }}>{typeof row.pay === 'boolean' ? (row.pay ? "Built-in" : "N/A") : row.pay}</td>
                        <td style={{ ...tdBase, textAlign: 'right', fontFamily: SANS, fontSize: 16, fontWeight: 600, color: INK, whiteSpace: 'nowrap' }}>{row.price}</td>
                      </tr>
                    ))}
                    <tr style={{ background: 'rgba(79,85,241,.06)' }}>
                      <td style={{ ...tdBase, borderBottom: 0, textAlign: 'left', fontFamily: SANS, fontSize: 16, fontWeight: 600, color: INDIGO, whiteSpace: 'nowrap' }}>A4 Accountant</td>
                      <td style={{ ...tdBase, borderBottom: 0 }}><Icon name="check" size={18} color={INDIGO} stroke={3} /></td>
                      <td style={{ ...tdBase, borderBottom: 0 }}><Icon name="check" size={18} color={INDIGO} stroke={3} /></td>
                      <td style={{ ...tdBase, borderBottom: 0 }}><Icon name="check" size={18} color={INDIGO} stroke={3} /></td>
                      <td style={{ ...tdBase, borderBottom: 0, fontFamily: SANS, fontSize: 13, fontWeight: 600, color: INDIGO }}>Full Service</td>
                      {/*
                        A "Starting" column, so this is the entry band only.
                        NOT "€24–49/mo": that would read as the full-service
                        range and invent a ceiling the ladder does not have. Under
                        pack mt-2026-08-27-entry bookkeeping is priced by monthly
                        expenses across nine bands plus volume plus additional
                        bank accounts (the first is included); with one account it
                        runs up to €339 self-employed / €549 for a company — see
                        BOOKKEEPING_SOLE_TOP and BOOKKEEPING_COMPANY_TOP in
                        src/data/a4QuotePack.ts.
                      */}
                      <td style={{ ...tdBase, borderBottom: 0, textAlign: 'right', fontFamily: SANS, fontSize: 16, fontWeight: 600, color: INDIGO, whiteSpace: 'nowrap' }}>From €{BOOKKEEPING_FROM}/mo</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* A4 MANAGED SECTION */}
            <section
              id="A4"
              data-fx="rise"
              data-dy="80"
              style={{ position: 'relative', overflow: 'hidden', marginTop: 80, padding: 'clamp(28px,5vw,64px)', borderRadius: 28, background: DARK_GRID, color: '#FFFFFF', scrollMarginTop: 96 }}
            >
              <DriftGlow left="30%" top="-60%" strength={0.3} />
              <div style={{ position: 'relative' }}>
                <div className="a4-eyebrow" style={{ color: PERI, fontSize: 16 }}>
                  <span aria-hidden="true" style={{ display: 'inline-block', width: 9, height: 9, borderRadius: 1, background: PERI, transform: 'skewX(-30deg)', alignSelf: 'center' }} />
                  <span>The Better Model</span>
                </div>
                <h2 style={{ margin: '18px 0 0', fontFamily: SANS, fontSize: 'clamp(32px,4vw,56px)', fontWeight: 500, letterSpacing: '-0.04em', lineHeight: 1.05, textWrap: 'balance' }}>
                  Software + <span style={{ fontWeight: 600, ...gradText, paddingBottom: '.06em' }}>a dedicated team</span> — built for Malta
                </h2>
                <p style={{ margin: '20px 0 0', maxWidth: 680, fontFamily: SANS, fontSize: 'clamp(18px,1.6vw,22px)', fontWeight: 500, letterSpacing: '-0.015em', lineHeight: 1.45, color: '#A1A1AA' }}>
                  A4 isn&apos;t bookkeeping software. It&apos;s a complete managed accounting service — a dedicated team of Malta-based accountants who handle your books, VAT, and management accounts.
                </p>

                <ul style={{ margin: '36px 0 0', padding: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '14px 40px' }}>
                  {MANAGED_FEATURES.map((feat, i) => (
                    <li key={i} style={{ display: 'flex', gap: 12, fontFamily: SANS, fontSize: 17, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.4, color: '#E4E4E7' }}>
                      <span className="a4-bullet" style={{ background: PERI }} />
                      {feat}
                    </li>
                  ))}
                </ul>

                <div style={{ marginTop: 40, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  <a href={CLIENT_ONBOARDING_URL} className="a4-btn a4-btn-light" style={{ textDecoration: 'none' }}>Get a Managed Quote</a>
                  <LocalizedLink href="/contact" className="a4-btn a4-btn-ghost" style={{ textDecoration: 'none' }}>Talk to a Partner</LocalizedLink>
                </div>
              </div>
            </section>

            {/* VERDICT */}
            <section id="verdict" style={{ marginTop: 80, scrollMarginTop: 96 }}>
              <h2 data-fx="rise" style={h2Style}>Our Verdict: Which Should You Choose?</h2>
              <div style={{ display: 'grid', gap: 16 }}>
                <div data-fx="rise" className="cp-card cp-static" style={{ padding: 'clamp(24px,3vw,32px)' }}>
                  <div style={{ ...kicker, marginBottom: 12 }}>If you&apos;re choosing software only</div>
                  <p style={{ margin: 0, fontFamily: BODY, fontSize: 17, lineHeight: 1.7, color: '#3F3F46' }}>
                    Use <span style={strong}>QuickBooks Online</span> for most Malta businesses — it&apos;s A4&apos;s platform of choice, with the best reporting depth and VAT compliance. <span style={strong}>Xero</span> is an excellent alternative with a cleaner interface, and a A4 direct integration is coming. If you have payroll complexity, look at Sage. If you&apos;re a freelancer, FreshBooks is the simplest entry point.
                  </p>
                </div>
                <div data-fx="rise" data-d="100" className="cp-card cp-dark cp-static" style={{ padding: 'clamp(24px,3vw,32px)' }}>
                  <div style={{ ...kicker, color: PERI, marginBottom: 12 }}>If you want your accounting actually handled</div>
                  <p style={{ margin: 0, fontFamily: BODY, fontSize: 17, lineHeight: 1.7, color: '#D4D4D8' }}>
                    <span style={{ color: '#FFFFFF', fontWeight: 600 }}>A4</span> is the only option on this list where a qualified team manages everything for you. The portal gives you the visibility you&apos;d get from logging into Xero — without any of the work. For Malta businesses that want clean books, accurate VAT returns, and monthly management accounts without doing it themselves, A4 is the right answer.
                  </p>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section id="faq" style={{ marginTop: 80, scrollMarginTop: 96 }}>
              <h2 data-fx="rise" style={h2Style}>Frequently Asked Questions</h2>
              <div style={{ borderBottom: '1px solid #E4E4E7' }}>
                {FAQS.map((faq, i) => {
                  const open = openFaq === i;
                  return (
                    <div key={i} data-fx="rise" data-d={i * 60} style={{ borderTop: '1px solid #E4E4E7' }}>
                      <button
                        type="button"
                        className="cp-acc-btn"
                        aria-expanded={open}
                        aria-controls={`bk-faq-${i}`}
                        id={`bk-faq-q-${i}`}
                        onClick={() => setOpenFaq(open ? null : i)}
                      >
                        <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 600, letterSpacing: '.02em', color: INDIGO }}>{String(i + 1).padStart(2, '0')}</span>
                        <span style={{ fontFamily: SANS, fontSize: 'clamp(18px,1.6vw,21px)', fontWeight: 500, letterSpacing: '-0.015em', lineHeight: 1.3, color: INK }}>{faq.q}</span>
                        <span className="cp-acc-plus" aria-hidden="true">
                          <Icon name="plus" size={18} color={INK} stroke={2} />
                        </span>
                      </button>
                      <div id={`bk-faq-${i}`} role="region" aria-labelledby={`bk-faq-q-${i}`} className="cp-acc-panel" data-open={open}>
                        <div inert={!open}>
                          <p className="cp-acc-answer" style={{ paddingRight: 0 }}>{faq.a}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </article>

          {/* SIDEBAR */}
          <aside className="w-full lg:sticky lg:top-24" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* TOC CARD */}
            <div className="cp-card cp-static" style={{ padding: 20 }}>
              <div style={{ ...kicker, margin: '2px 0 12px 12px' }}>On this page</div>
              <nav aria-label="On this page" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {TOC.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="toc-link cp-toc-link cp-focus"
                    style={{ display: 'grid', gridTemplateColumns: '22px 1fr', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 12, borderLeft: '2px solid transparent', fontFamily: SANS, fontSize: 15, fontWeight: 500, color: '#52525B', textDecoration: 'none', transition: 'background .25s, color .25s' }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#71717A' }}>{item.num}</span>
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* SHARE CARD */}
            <div className="cp-card cp-static" style={{ padding: 20 }}>
              <div style={{ ...kicker, marginBottom: 14 }}>Share this review</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                  className="a4-btn a4-btn-outline"
                  style={{ flex: 1, height: 44, padding: '0 14px', fontSize: 14.5 }}
                >
                  Copy Link
                </button>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://a4.com.mt/insights/bookkeeping')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="a4-btn a4-btn-outline"
                  style={{ flex: 1, height: 44, padding: '0 14px', fontSize: 14.5, textDecoration: 'none' }}
                >
                  LinkedIn
                </a>
              </div>
            </div>

            {/* CTA CARD */}
            <div className="cp-card cp-dark cp-static" style={{ padding: 24 }}>
              <h5 style={{ margin: 0, fontFamily: SANS, fontSize: 24, fontWeight: 600, letterSpacing: '-0.035em', lineHeight: 1.12, color: '#FFFFFF' }}>Stop managing software yourself</h5>
              <p style={{ margin: '10px 0 20px', fontFamily: BODY, fontSize: 14, lineHeight: 1.6, color: '#A1A1AA' }}>Let A4 handle your bookkeeping, VAT, and audit preparation while you focus on growth.</p>
              <a href={CLIENT_ONBOARDING_URL} className="a4-btn a4-btn-light" style={{ width: '100%', height: 48, fontSize: 16, textDecoration: 'none' }}>See Managed Pricing</a>
              <div style={{ marginTop: 12, textAlign: 'center', fontFamily: BODY, fontSize: 12.5, color: '#71717A' }}>Free 30-minute consultation included.</div>
            </div>
          </aside>
        </div>
      </section>

      {/* RELATED BLOGS */}
      {relatedBlogs.length > 0 && (
        <section style={{ position: 'relative', padding: 'clamp(100px,13vw,180px) clamp(20px,5vw,72px)', background: MUTED_GLOW, color: INK }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 40 }}>
              <div>
                <h2 data-fx="rise" style={{ margin: 0, fontFamily: SANS, fontSize: 'clamp(36px,4.6vw,72px)', fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1.03 }}>Related reading</h2>
                <p data-fx="rise" data-d="100" style={{ margin: '14px 0 0', maxWidth: 560, fontFamily: BODY, fontSize: 18, lineHeight: 1.55, color: '#52525B' }}>
                  Expand your knowledge on Malta&apos;s business landscape.
                </p>
              </div>
              <LocalizedLink href="/insights" className="cp-link cp-focus hidden md:inline-flex">
                View all insights <Icon name="arrow-up-right" size={18} color={INDIGO} />
              </LocalizedLink>
            </div>

            <div className="cp-grid">
              {relatedBlogs.map((relatedBlog, i) => {
                const dark = i % 2 === 1;
                return (
                  <LocalizedLink
                    key={relatedBlog.slug}
                    href={`/insights/${relatedBlog.slug}`}
                    data-fx="rise"
                    data-d={i * 80}
                    className={`cp-card cp-focus${dark ? ' cp-dark' : ''}`}
                    style={{ display: 'flex', flexDirection: 'column', padding: 28 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
                      <span style={{ height: 28, padding: '0 12px', display: 'inline-flex', alignItems: 'center', borderRadius: 999, fontFamily: SANS, fontSize: 13, fontWeight: 600, background: dark ? 'rgba(139,143,247,.18)' : 'rgba(79,85,241,.1)', color: dark ? '#FFFFFF' : INDIGO }}>
                        {relatedBlog.tags ? relatedBlog.tags[0] : 'Insight'}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: BODY, fontSize: 13, color: dark ? '#A1A1AA' : '#71717A' }}>
                        <Icon name="calendar" size={14} color={dark ? '#A1A1AA' : '#71717A'} />
                        {format(new Date(relatedBlog.date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <h3 style={{ margin: 0, fontFamily: SANS, fontSize: 24, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.15, color: dark ? '#FFFFFF' : INK }} className="line-clamp-2">
                      {relatedBlog.title}
                    </h3>
                    <p style={{ margin: '12px 0 24px', fontFamily: BODY, fontSize: 15, lineHeight: 1.55, color: dark ? '#A1A1AA' : '#52525B' }} className="line-clamp-2">
                      {relatedBlog.excerpt}
                    </p>
                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 18, borderTop: `1px solid ${dark ? 'rgba(255,255,255,.1)' : '#E4E4E7'}` }}>
                      <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: dark ? '#FFFFFF' : INK }}>{relatedBlog.author}</span>
                      <span aria-hidden="true" className="cp-arrow" style={{ width: 40, height: 40, borderRadius: '50%', display: 'grid', placeItems: 'center', border: `1px solid ${dark ? 'rgba(255,255,255,.18)' : '#E4E4E7'}` }}>
                        <Icon name="arrow-up-right" size={17} color={dark ? '#FFFFFF' : INK} />
                      </span>
                    </div>
                  </LocalizedLink>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
