"use client"

import React, { useMemo } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import LocalizedLink from '@/components/common/LocalizedLink'
import { stripLocaleFromPathname } from '@/lib/localized-path'
import { A4_SERVICES_VISIBLE } from '@/data/a4ServicesSiteData'
import {
  CONTACT_EMAIL,
  CONTACT_EMAIL_HREF,
  CONTACT_PHONES,
  LINKEDIN_COMPANY_URL,
} from '@/lib/contact'
import FooterCtaStrip from './FooterCtaStrip'

const Logo = '/assets/images/a4-logo-new.webp'
const VaceiLogo = '/assets/images/vacei-logo-teal.png'

const Footer = () => {
  const pathname = usePathname()
  const { t } = useTranslation('common')
  const barePath = stripLocaleFromPathname(pathname)
  const hideChromeRoutes = [
    '/privacy-policy',
    '/terms-and-conditions',
    '/cookie-policy',
  ]

  const services = useMemo(
    () => A4_SERVICES_VISIBLE,
    []
  )
  const servicesMid = Math.ceil(services.length / 2)
  const servicesCol1 = services.slice(0, servicesMid)
  const servicesCol2 = services.slice(servicesMid)

  if (hideChromeRoutes.includes(barePath)) {
    return null
  }

  const sectionClass = 'space-y-4 flex flex-col items-center text-center md:items-start md:text-left'
  const listClass = 'space-y-2 w-full'
  const linkClass = 'text-sm text-gray hover:text-primary-blue transition-colors inline-block'

  return (
    <footer className="w-full relative overflow-hidden ">
      <FooterCtaStrip />
      <div className="absolute inset-0 -z-20 bg-white " />
      <div className="absolute top-0 left-0 right-0 h-[260px] md:h-[300px] -z-10 bg-background" />
      {/* <div className="relative w-full -mt-48 md:-mt-56 mb-16 flex justify-center">
        {!pathname.includes('/careers') && <GetStartedHero />}
      </div> */}

      <div className="pointer-events-none">
        <div className="absolute bottom-0 left-0 w-[350px] h-[330px]  transform -rotate-360">
          <Image
            src="/assets/images/radial3.png"
            alt="Radial Gradient Pattern"
            fill
          />
        </div>
        <div className="absolute bottom-0 right-0 w-[350px] h-[330px]  transform -rotate-90">
          <Image
            src="/assets/images/radial3.png"
            alt="Radial Gradient Pattern"
            fill
          />
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Logo & tagline */}
          <div className={`${sectionClass} lg:col-span-3`}>
            <LocalizedLink href="/" className="flex items-center gap-3 justify-center md:justify-start">
              <div className="flex items-center justify-center">
                <Image
                  src={Logo}
                  alt="A4"
                  width={120}
                  height={56}
                  className="object-contain"
                />
              </div>
            </LocalizedLink>

            <p className="text-sm text-gray leading-relaxed max-w-xs">
              {t('footer.tagline')}
            </p>

            {/* The firm/software split, stated plainly: A4 is the firm, Vacei
                is the software platform it builds and runs. Mirrored on
                vacei.com, which carries the A4 mark. */}
            <div className="w-full max-w-xs pt-3 mt-1 border-t border-gray-200 flex flex-col items-center md:items-start gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray">
                Our software platform
              </span>
              <a
                href="https://vacei.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Vacei — the software platform built by A4 Services"
                className="inline-flex"
              >
                <Image
                  src={VaceiLogo}
                  alt="Vacei"
                  width={112}
                  height={52}
                  className="object-contain"
                />
              </a>
              <p className="text-xs text-gray leading-relaxed">
                A4 Services is the firm. Vacei is the software platform we build
                and run — the client portal, books and audit tools behind every
                engagement.{' '}
                <a
                  href="https://vacei.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary-blue hover:underline"
                >
                  vacei.com
                </a>
              </p>
            </div>

            <div className="flex items-center gap-4 pt-2 justify-center md:justify-start">
              <a
                href={LINKEDIN_COMPANY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center bg-primary-blue rounded-full text-white transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Platform */}
          <div className={`${sectionClass} lg:col-span-2`}>
            <h3 className="text-text-dark font-bold text-base">{t('footer.platform')}</h3>
            <ul className={listClass}>
              <li>
                <LocalizedLink href="/" className={linkClass}>
                  {t('footer.overview')}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink href="/how-it-works" className={linkClass}>
                  {t('footer.howItWorks')}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink href="/pricing" className={linkClass}>
                  {t('footer.pricing')}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink href="/security-compliance" className={linkClass}>
                  {t('footer.security')}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink href="/#why-A4" className={linkClass}>
                  {t('footer.whyA4')}
                </LocalizedLink>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className={`${sectionClass} lg:col-span-2`}>
            <h3 className="text-text-dark font-bold text-base">{t('footer.company')}</h3>
            <ul className={listClass}>
              <li>
                <LocalizedLink href="/about" className={linkClass}>
                  {t('footer.about')}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink href="/faq" className={linkClass}>
                  {t('footer.faqs')}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink href="/insights" className={linkClass}>
                  {t('footer.insights')}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink href="/resources" className={linkClass}>
                  Resources
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink href="/white-label-platform" className={linkClass}>
                  {t('footer.whiteLabelLanding')}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink href="/partners-platform" className={linkClass}>
                  {t('footer.partnerPlatformLanding')}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink href="/cpe" className={linkClass}>
                  {t('footer.cpePodcast')}
                </LocalizedLink>
              </li>
            </ul>
          </div>

          {/* Services — 18 items in two columns */}
          <div className={`${sectionClass} lg:col-span-5 lg:items-start`}>
            <h3 className="text-text-dark font-bold text-base">{t('footer.services')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 w-full text-center sm:text-left">
              <ul className={listClass}>
                {servicesCol1.map((service) => (
                  <li key={service.key}>
                    <LocalizedLink href={`/services/${service.slug}`} className={linkClass}>
                      {service.name}
                    </LocalizedLink>
                  </li>
                ))}
              </ul>
              <ul className={listClass}>
                {servicesCol2.map((service) => (
                  <li key={service.key}>
                    <LocalizedLink href={`/services/${service.slug}`} className={linkClass}>
                      {service.name}
                    </LocalizedLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Contact — separate band below main grid */}
        <div className="mt-12 pt-10 border-t border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] gap-8 lg:gap-16 items-start">
            <div className="space-y-3 flex flex-col items-center text-center lg:items-start lg:text-left">
              <h3 className="text-text-dark font-bold text-base">{t('footer.contactUs')}</h3>
              <p className="text-sm text-gray max-w-md leading-relaxed">
                Speak to the team — call, email or book a free 30-minute consultation.
              </p>
              <LocalizedLink
                href="/contact"
                className="inline-flex items-center justify-center rounded-lg bg-primary-blue px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                {t('footer.contact')}
              </LocalizedLink>
            </div>

            <ul className="flex flex-col gap-4 w-full max-w-[360px] mx-auto lg:mx-0 lg:ml-auto">
              <li className="flex items-start gap-3.5">
                <span className="w-9 h-9 shrink-0 rounded-full bg-primary-blue text-white flex items-center justify-center mt-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                <div className="flex flex-col gap-0.5 pt-0.5 min-w-0 text-left">
                  {CONTACT_PHONES.map((phone) => (
                    <a
                      key={phone.href}
                      href={phone.href}
                      className="text-sm text-gray hover:text-primary-blue transition-colors"
                    >
                      {phone.display}
                    </a>
                  ))}
                </div>
              </li>
              <li className="flex items-start gap-3.5">
                <span className="w-9 h-9 shrink-0 rounded-full bg-primary-blue text-white flex items-center justify-center mt-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <a
                  href={CONTACT_EMAIL_HREF}
                  className="text-sm text-gray hover:text-primary-blue transition-colors pt-2 min-w-0 text-left"
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li className="flex items-start gap-3.5">
                <span className="w-9 h-9 shrink-0 rounded-full bg-primary-blue text-white flex items-center justify-center mt-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                <span className="text-sm text-gray leading-relaxed pt-2 min-w-0 text-left">
                  A4, Triq San Giljan, San Gwann, Malta.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 text-center md:text-left">
          {/* text-gray-400 on this white panel measured 2.6:1 — below the 4.5:1
              WCAG AA floor for body text. --text-gray (#52525b) is the token
              already used elsewhere in this footer and measures 7.7:1. */}
          <p className="text-xs text-gray font-medium leading-relaxed max-w-4xl mx-auto md:mx-0">
            {t('footer.disclaimer')}
          </p>
        </div>
      </div>

      <div className=" max-w-6xl mx-auto relative z-10 border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray text-center">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <LocalizedLink href="/terms-and-conditions" className="hover:text-primary-blue transition-colors">
                {t('footer.terms')}
              </LocalizedLink>
              <span className="text-light-gray">|</span>
              <LocalizedLink href="/privacy-policy" className="hover:text-primary-blue transition-colors">
                {t('footer.privacy')}
              </LocalizedLink>
              <span className="text-light-gray">|</span>
              <LocalizedLink href="/cookie-policy" className="hover:text-primary-blue transition-colors">
                {t('footer.cookies')}
              </LocalizedLink>
            </div>
            {/* Was text-light-gray (#a1a1aa) = 2.56:1 on this white bar, an AA
                fail. The parent already carries text-gray (7.7:1); inherit it. */}
            <div>
              {t('footer.copyright')}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
