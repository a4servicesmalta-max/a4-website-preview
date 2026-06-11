export type CpeItem = { icon: string; t: string; s: string };

export const CPE_ITEMS: CpeItem[] = [
  {
    icon: "calendar-clock",
    t: "Upcoming sessions",
    s: "Live, accredited CPE webinars on audit, tax, VAT and financial reporting — register and earn structured hours.",
  },
  {
    icon: "library",
    t: "On-demand library",
    s: "A growing catalogue of recorded sessions you can watch anytime, at your own pace.",
  },
  {
    icon: "award",
    t: "Certificates",
    s: "Download your CPE certificate automatically once you complete a session.",
  },
];

export const PODCAST_ITEMS: CpeItem[] = [
  { icon: "mic", t: "Episodes", s: "Honest conversations on finance, compliance and building a modern firm." },
  { icon: "users", t: "Guests", s: "Practitioners, founders and regulators sharing what actually works." },
  { icon: "podcast", t: "Be a guest", s: "Got a story or a strong view? We'd love to have you on the show." },
];
