"use client";

import React, { useState } from "react";
import Image from "next/image";
import GradientContainer from "../common/GradientContainer";
import GetInstantQuoteButton from "../common/GetInstantQuoteButton";

interface BaseCard {
  id: number;
  title: string;
  subtitle?: string;
  image: string;
  hoverImage?: string;
  link: string;
}

const ServicesSection = () => {
  const [activeTab, setActiveTab] = useState<
    "services" | "experts" | "products"
  >("services");
  const [currentIndex, setCurrentIndex] = useState(0);

  const services: BaseCard[] = [
    {
      id: 1,
      title: "Corporate Service",
      image: "/assets/images/placeholder.png",
      link: "/services/corporate-csp-services",
    },
    {
      id: 2,
      title: "Accounting and Finance",
      image: "/assets/images/placeholder.png",
      link: "/services/accounting-finance",
    },
    {
      id: 3,
      title: "Tax and Compliance",
      image: "/assets/images/placeholder.png",
      link: "/services/tax-compliance",
    },
    {
      id: 4,
      title: "Audit and Assurance",
      image: "/assets/images/placeholder.png",
      link: "/services/audit-assurance",
    },
  ];

  const experts: BaseCard[] = [
    {
      id: 1,
      title: "Accountants",
      image: "/assets/images/pngegg (2) 1.png",
      link: "/experts/accountants",
    },
    {
      id: 2,
      title: "Bookkeepers",
      image: "/assets/images/pngegg (3) 1.png",
      link: "/experts/bookkeepers",
    },
    {
      id: 3,
      title: "Tax specialists",
      image: "/assets/images/pngegg (1) 1.png",
      link: "/experts/tax",
    },
    {
      id: 4,
      title: "Audit team",
      image: "/assets/images/pngegg (4) 1.png",
      link: "/experts/audit",
    },
  ];

  const products: BaseCard[] = [
    {
      id: 1,
      title: "A4 Accounting Portal",
      subtitle: "Your entire business, in one place.",
      image: "/assets/images/Cube 1.png",
      hoverImage: "/assets/images/Accounting 1.png",
      link: "/portal/accounting-portal",
    },
    {
      id: 2,
      title: "A4 Client Portal",
      subtitle: "Your entire business, in one place.",
      image: "/assets/images/Pyramid 2.png",
      hoverImage: "/assets/images/portal.png",
      link: "/portal/client-portal",
    },
    {
      id: 3,
      title: "A4 Audit Portal",
      subtitle: "Your entire business, in one place.",
      image: "/assets/images/Thorus Knot.png",
      hoverImage: "/assets/images/Audit 1.png",
      link: "/portal/audit-portal",
    },
  ];

  const getActiveData = () => {
    switch (activeTab) {
      case "experts":
        return experts;
      case "products":
        return products;
      case "services":
      default:
        return services;
    }
  };

  const activeData = getActiveData();
  const visibleCards = activeTab === "products" ? 3 : 4;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % activeData.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + activeData.length) % activeData.length,
    );
  };

  const displayServices = [];
  if (activeData.length <= visibleCards) {
    displayServices.push(...activeData);
  } else {
    for (let i = 0; i < visibleCards; i++) {
      const index = (currentIndex + i) % activeData.length;
      displayServices.push(activeData[index]);
    }
  }

  return (
    <section className="w-full py-16 lg:py-20">
      <div className="mx-auto px-4 md:px-6 lg:px-8">
        <GradientContainer
          className="py-12 lg:py-16 relative"
          backgroundColor="bg-gradient-container"
        >
          {/* Navigation Tabs */}
          <div className="flex justify-center mb-12 relative z-20">
            <div className="inline-flex bg-white/5 backdrop-blur-sm border border-white/10 rounded-full p-1.5 gap-2">
              {(["services", "experts", "products"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setCurrentIndex(0);
                  }}
                  className={`px-8 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === tab
                      ? "bg-tab-active text-white shadow-lg shadow-primary-blue"
                      : "text-gray hover:text-white hover:bg-white/5"
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Carousel */}
          <div className="relative">
            <div
              className={`flex justify-center gap-6 lg:gap-8 mb-8 relative z-10 min-h-[500px]`}
            >
              {displayServices.map((item) =>
                activeTab === "products" ? (
                  // Product Card Design
                  <div
                    key={item.id}
                    className="group relative w-[350px] lg:w-[400px] h-[500px] bg-card/50 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-white/20 hover:-translate-y-2 cursor-pointer"
                  >
                    {/* Default Content (Bottom Layer) */}
                    <div className="absolute inset-0 flex flex-col items-center justify-between p-8 z-0">
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-white mb-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-300">{item.subtitle}</p>
                      </div>

                      <div className="relative w-48 h-48">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-contain drop-shadow-lg"
                        />
                      </div>

                      <GetInstantQuoteButton
                        variant="custom"
                        text="Get Instant Quote"
                        href={item.link}
                        bgColor="var(--button-indigo)"
                        textColor="white"
                        className="shadow-lg shadow-primary-blue/30 text-xs px-6 py-2"
                      />
                    </div>

                    {/* Hover Content - Portal UI Image Overlay (Top Layer) */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none group-hover:pointer-events-auto"
                      style={{ backgroundColor: "var(--card-hover-overlay)" }}
                    >
                      <GradientContainer
                        className="w-full h-full flex flex-col items-center pt-8"
                        backgroundColor="bg-transparent"
                      >
                        <div className="text-center mb-6 relative z-10 px-6">
                          <h3 className="text-xl font-bold text-white mb-2">
                            {item.title}
                          </h3>
                          <p className="text-xs text-white/80 mb-4">
                            {item.subtitle}
                          </p>
                          <GetInstantQuoteButton
                            variant="custom"
                            text="Get Instant Quote"
                            href={item.link}
                            bgColor="var(--button-indigo)"
                            textColor="white"
                            className="shadow-lg shadow-primary-blue/30 text-xs px-6 py-2"
                          />
                        </div>

                        <div className="relative w-full flex-1 mt-2 transform translate-y-4 transition-transform duration-500 group-hover:translate-y-0 px-4 pb-0">
                          {item.hoverImage && (
                            <div className="relative w-full h-full rounded-t-xl overflow-hidden shadow-2xl bg-white/5 border-t border-l border-r border-white/20">
                              <Image
                                src={item.hoverImage}
                                alt={`${item.title} Interface`}
                                fill
                                className="object-cover object-top"
                              />
                            </div>
                          )}
                        </div>
                      </GradientContainer>
                    </div>
                  </div>
                ) : (
                  // Expert & Service Card Design
                  <div
                    key={item.id}
                    className="group relative w-[300px] h-[500px] bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Image Area */}
                    <div
                      className={`relative w-full h-[60%] overflow-hidden ${activeTab === "experts" ? "bg-card-hover-overlay" : "bg-gray-100"}`}
                    >
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className={`object-contain p-4 transition-transform duration-500 group-hover:scale-105 ${activeTab === "experts" ? "object-bottom pb-0" : "object-center"}`}
                      />
                    </div>

                    {/* Content Area */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white h-[40%] p-6 flex flex-col justify-between border-t border-input">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">
                          {item.title}
                        </h3>
                        <div className="w-12 h-1 bg-tab-active rounded mb-3"></div>
                      </div>

                      <div className="flex items-center gap-2 text-tab-active font-semibold text-sm group-hover:text-tab-active-hover cursor-pointer transition-colors">
                        <span>Request Service</span>
                        <svg
                          className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-3 mt-4">
              <button
                onClick={prevSlide}
                className="w-10 h-10 rounded-full bg-tab-active text-white flex items-center justify-center hover:bg-tab-active-hover transition-all shadow-lg hover:shadow-primary-blue"
                aria-label="Previous"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="w-10 h-10 rounded-full border-2 border-tab-active text-tab-active flex items-center justify-center hover:bg-tab-active hover:text-white transition-all shadow-lg hover:shadow-primary-blue"
                aria-label="Next"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </GradientContainer>
      </div>
    </section>
  );
};

export default ServicesSection;
