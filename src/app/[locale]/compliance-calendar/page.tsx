import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import "@/components/a4-site/site-pages.css";
import { Container, Reveal } from "@/components/a4-landing/Primitives";
import { PageHero } from "../services/components/PageHero";
import { ServicePortalBand } from "../services/components/ServicePortalBand";
import { CalendarDownloadForm } from "../lead-magnets/components/LeadMagnetPages";
import { InteractiveCalendar } from "./components/InteractiveCalendar";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata(
  "Malta Compliance Deadline Calendar",
  "Interactive Malta compliance calendar — VAT, FS5 payroll, provisional tax, MBR and company deadlines, filterable by month, with a free .ics download.",
);

export default function ComplianceCalendarPage() {
  return (
    <div className="a4-site-page">
      <PageHero
        eyebrow="Compliance calendar"
        title="Every Malta filing deadline, in one calendar"
        sub="Browse VAT, payroll, tax and MBR deadlines month by month — then add them to your own calendar in one click."
      />
      <InteractiveCalendar />
      <section className="bg-[var(--a4-canvas-light)]" style={{ padding: "0 0 clamp(56px,8vw,96px)" }}>
        <Container>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12 items-start">
            <Reveal>
              <h2 className="a4-font-display font-medium text-[var(--a4-ink)]" style={{ fontSize: "clamp(24px,3vw,32px)" }}>
                Take the deadlines with you
              </h2>
              <p className="a4-font-body text-[15px] text-[var(--a4-mute)] mt-4 leading-relaxed" style={{ maxWidth: 520 }}>
                Download the same calendar as an .ics file and every VAT, payroll, provisional-tax and company
                deadline lands in Outlook, Google Calendar or Apple Calendar — updated for the next twelve months.
              </p>
              <p className="a4-font-body text-[13px] text-[var(--a4-mute)] mt-5">
                Dates are indicative — your company&apos;s year-end and VAT periods may shift exact deadlines.
                A4 clients get a tailored compliance calendar in their portal.
              </p>
            </Reveal>
            <CalendarDownloadForm />
          </div>
        </Container>
      </section>
      <ServicePortalBand serviceName="MBR compliance" />
    </div>
  );
}
