"use client";

import GetInstantQuoteButton from "../common/GetInstantQuoteButton";
import { useTranslation } from "react-i18next";

const HeroLeftPanel = () => {
  const { t } = useTranslation("home");

  return (
    <div className="relative h-full min-h-[700px] w-full px-6 pt-16 pb-12 lg:px-16 lg:pt-24 lg:pb-16 flex flex-col justify-between">
      <div className="absolute left-6 bottom-24 hidden lg:flex flex-col items-center gap-4 text-white/50 z-20">
        <span
          className="text-[10px] font-medium tracking-[0.3em] uppercase rotate-180"
          style={{ writingMode: "vertical-rl" }}
        >
          {t("heroLeft.scrollDown")}
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/50">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 w-full flex-1 flex flex-col">
        <h1
          className="font-sans font-bold tracking-[-0.04em] text-[80px] leading-[0.9] md:text-[100px]  text-white opacity-100"
          style={{ fontFamily: "var(--font-mona-sans), system-ui, sans-serif" }}
        >
          {t("heroLeft.title")}
        </h1>

        <div className="mt-auto mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-12 z-20">
          <div className="flex flex-col sm:flex-row gap-6 pl-2 pb-2">
            <GetInstantQuoteButton className="h-[60px] w-[230px] shadow-primary-blue hover:shadow-[0_12px_50px_var(--primary-zinc-shadow)] transition-shadow" />
            <GetInstantQuoteButton
              variant="book-demo"
              className="h-[60px] w-[190px] border-white/20 hover:bg-white/5"
            />
          </div>

          <div className="max-w-[480px] lg:text-right lg:mr-4 lg:mb-4">
            <p className="text-[16px] leading-[1.8] text-light-gray font-normal">{t("heroLeft.body")}</p>
          </div>
        </div>

        <div className="mt-auto flex justify-end lg:mr-4 pt-12">
          <div className="flex items-start gap-4 max-w-[400px]">
            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white/5 border border-white/10">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z"
                  fill="currentColor"
                  className="text-white"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-white">{t("heroLeft.footerTitle")}</h3>
              <p className="mt-1 text-[13px] text-light-gray leading-relaxed">{t("heroLeft.footerBody")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroLeftPanel;
