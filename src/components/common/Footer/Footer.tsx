"use client"

import React, { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Linkedin } from 'lucide-react'
import LocalizedLink from '@/components/common/LocalizedLink'
import { DARK_GRID, DriftGlow, GlitchLockup } from '@/components/fx/primitives'
import { stripLocaleFromPathname } from '@/lib/localized-path'
import { A4_SERVICES_VISIBLE } from '@/data/a4ServicesSiteData'
import {
  CONTACT_EMAIL,
  CONTACT_EMAIL_HREF,
  CONTACT_PHONES,
  LINKEDIN_COMPANY_URL,
} from '@/lib/contact'
import { BOOK_A_CALL_PATH } from '@/lib/external-links'

const HIDE_CHROME = ['/privacy-policy', '/terms-and-conditions', '/cookie-policy']

/**
 * The footer in the A4 design language. Every page ends on the teaser film's end
 * card: a full screen on the dark grid where the white lockup glitches into place,
 * "Accounting that works differently.", Powered by Vacei, and the two ways to start.
 * Then the link columns, contact details and the legal line.
 */
const Footer = () => {
  const pathname = usePathname()
  const { t } = useTranslation('common')
  const barePath = stripLocaleFromPathname(pathname)
  const services = useMemo(() => A4_SERVICES_VISIBLE, [])

  if (HIDE_CHROME.includes(barePath)) return null

  const heading = (n: string, label: string) => (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, fontSize: 15, fontWeight: 600, letterSpacing: '.02em', color: '#A1A1AA', marginBottom: 14 }}>
      <span style={{ color: '#8B8FF7' }}>{n}</span>
      <span>{label}</span>
    </div>
  )
  const link: React.CSSProperties = { display: 'inline-block', padding: '5px 0', fontSize: 15, fontWeight: 500, color: '#E4E4E7', textDecoration: 'none' }

  const platform: [string, string][] = [
    ['/', t('footer.overview')],
    ['/how-it-works', t('footer.howItWorks')],
    ['/pricing', t('footer.pricing')],
    ['/security-compliance', t('footer.security')],
    ['/quote', 'Get a quote'],
  ]
  const company: [string, string][] = [
    ['/about', t('footer.about')],
    ['/faq', t('footer.faqs')],
    ['/insights', t('footer.insights')],
    ['/resources', 'Resources'],
    ['/white-label-platform', t('footer.whiteLabelLanding')],
    ['/partners-platform', t('footer.partnerPlatformLanding')],
    ['/cpe', t('footer.cpePodcast')],
  ]

  return (
    <footer style={{ position: 'relative', overflow: 'hidden', color: '#FFFFFF', background: DARK_GRID, fontFamily: 'var(--a4x-display)' }}>
      <DriftGlow left="-10%" top="-20%" strength={0.22} />
      <section
        aria-label="Get started with A4"
        style={{
          position: 'relative',
          minHeight: '100svh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(96px,12vw,160px) clamp(20px,5vw,72px)',
        }}
      >
        <GlitchLockup tagline="Accounting that works differently.">
          <a
            data-glitch-after=""
            href="https://vacei.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Powered by Vacei — the software platform built by A4 Services"
            style={{ marginTop: 28, display: 'inline-flex', alignItems: 'center', height: 56, padding: '0 24px', borderRadius: 28, border: '1px solid rgba(255,255,255,.22)', background: 'rgba(255,255,255,.06)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/a4/powered-by-vacei-white.png" alt="Powered by Vacei" style={{ height: 26, width: 'auto', display: 'block' }} />
          </a>
          <div data-glitch-after="" style={{ marginTop: 'clamp(36px,4vw,56px)', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
            <LocalizedLink href="/quote" className="a4-btn a4-btn-light" style={{ textDecoration: 'none' }}>
              Get a quote
            </LocalizedLink>
            <LocalizedLink href={BOOK_A_CALL_PATH} className="a4-btn a4-btn-ghost" style={{ textDecoration: 'none' }}>
              {t('footer.ctaStripButton')}
            </LocalizedLink>
          </div>
        </GlitchLockup>
      </section>

      <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto', padding: '0 clamp(20px,5vw,72px)' }}>
        <div style={{ borderTop: '1px solid rgba(255,255,255,.08)' }} />

        <div
          data-fx="rise"
          style={{
            marginTop: 'clamp(80px,9vw,120px)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
            gap: '40px 32px',
          }}
        >
          <div>
            {heading('01', t('footer.platform'))}
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {platform.map(([href, label]) => (
                <li key={href}><LocalizedLink href={href} className="a4-foot-link" style={link}>{label}</LocalizedLink></li>
              ))}
            </ul>
          </div>
          <div>
            {heading('02', t('footer.company'))}
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {company.map(([href, label]) => (
                <li key={href}><LocalizedLink href={href} className="a4-foot-link" style={link}>{label}</LocalizedLink></li>
              ))}
            </ul>
          </div>
          <div style={{ gridColumn: 'span 2' }} className="a4-foot-services">
            {heading('03', t('footer.services'))}
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, columns: 2, columnGap: 32 }}>
              {services.map((s) => (
                <li key={s.key} style={{ breakInside: 'avoid' }}>
                  <LocalizedLink href={`/services/${s.slug}`} className="a4-foot-link" style={link}>{s.name}</LocalizedLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            {heading('04', t('footer.contactUs'))}
            <div style={{ display: 'grid', gap: 6, fontFamily: 'var(--a4x-body)', fontSize: 15, color: '#A1A1AA' }}>
              {CONTACT_PHONES.map((p) => (
                <a key={p.href} href={p.href} className="a4-foot-link" style={{ ...link, fontFamily: 'inherit' }}>{p.display}</a>
              ))}
              <a href={CONTACT_EMAIL_HREF} className="a4-foot-link" style={{ ...link, fontFamily: 'inherit' }}>{CONTACT_EMAIL}</a>
              <span style={{ padding: '5px 0' }}>A4, Triq San Giljan, San Gwann, Malta.</span>
              <a
                href={LINKEDIN_COMPANY_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                style={{ marginTop: 8, width: 40, height: 40, display: 'grid', placeItems: 'center', borderRadius: 999, border: '1px solid rgba(255,255,255,.18)', background: 'rgba(255,255,255,.06)', color: '#FFFFFF' }}
              >
                <Linkedin size={17} strokeWidth={1.75} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        <p style={{ margin: 'clamp(56px,6vw,80px) 0 0', maxWidth: 900, fontFamily: 'var(--a4x-body)', fontSize: 13, lineHeight: 1.6, color: '#71717A' }}>
          {t('footer.disclaimer')}
        </p>

        <div style={{ margin: '28px 0 0', padding: '22px 0 32px', borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, fontFamily: 'var(--a4x-body)', fontSize: 13, color: '#71717A' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
            <LocalizedLink href="/terms-and-conditions" className="a4-foot-link" style={{ color: '#A1A1AA', textDecoration: 'none' }}>{t('footer.terms')}</LocalizedLink>
            <LocalizedLink href="/privacy-policy" className="a4-foot-link" style={{ color: '#A1A1AA', textDecoration: 'none' }}>{t('footer.privacy')}</LocalizedLink>
            <LocalizedLink href="/cookie-policy" className="a4-foot-link" style={{ color: '#A1A1AA', textDecoration: 'none' }}>{t('footer.cookies')}</LocalizedLink>
          </div>
          <span>{t('footer.copyright')} · <a href="https://a4.com.mt" style={{ color: '#A1A1AA', textDecoration: 'none' }}>a4.com.mt</a></span>
        </div>
      </div>
      <style>{`
        .a4-foot-link { transition: color .25s; }
        .a4-foot-link:hover { color: #FFFFFF !important; }
        @media (max-width: 520px) { .a4-foot-services { grid-column: auto !important; } .a4-foot-services ul { columns: 1 !important; } }
      `}</style>
    </footer>
  )
}

export default Footer
