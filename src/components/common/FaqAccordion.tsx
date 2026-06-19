"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, MessageCircle, Phone } from "lucide-react";
import SectionBadge from "./SectionBadge";
import TextAnimation from "./TextAnimation";
import { usePerformance } from "@/contexts/ReduceMotionContext";
import { cn } from "@/lib/utils";
import { CONTACT_PHONES_DISPLAY } from "@/lib/contact";

interface FaqItem {
  title: string;
  content: string;
}

interface FaqAccordionProps {
  faqItems: FaqItem[];
  logoImage?: string;
  companyName?: string;
  phoneNumber?: string;
  callToActionText?: string;
  backgroundColor?: string;
  showRadials?: boolean;
}

const FaqAccordion = ({
  faqItems,
  phoneNumber = CONTACT_PHONES_DISPLAY,
  callToActionText = "Need more help?",
}: FaqAccordionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { isIPhone, isLowPerformance } = usePerformance();

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden ">
       {/* Background Decor - Light Gradients - Hidden on iPhone for performance */}
       {!isIPhone && !isLowPerformance && (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[-5%] w-[500px] h-[500px] bg-zinc-100/40 rounded-full blur-[80px]" />
          <div className="absolute bottom-[20%] right-[-5%] w-[400px] h-[400px] bg-zinc-100/40 rounded-full blur-[80px]" />
        </div>
       )}

      <div className="relative max-w-6xl mx-auto px-4 md:px-6 lg:px-8 z-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Title & Support Card */}
          <div className="lg:w-1/3 lg:sticky lg:top-24">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.6 }}
            >
                <SectionBadge text="FAQ" className={cn(
                  "border border-gray-200 text-heading shadow-sm",
                  isIPhone || isLowPerformance ? "bg-white" : "bg-white/80 backdrop-blur-md"
                )} />
                <TextAnimation
                  text="Frequently Asked Questions"
                  as="h2"
                  className="mt-4 text-3xl md:text-4xl font-medium text-heading leading-tight"
                />
                <p className="mt-4 text-gray text-base leading-relaxed mb-8">
                  Everything you need to know about our services, pricing, and process.
                </p>

                {/* Glass Support Card */}
                <div className={cn(
                  "p-6 rounded-3xl border shadow-lg relative overflow-hidden group hover:shadow-xl transition-all duration-500",
                  isIPhone || isLowPerformance ? "bg-white border-gray-100" : "bg-white/60 backdrop-blur-xl border-white/60"
                )}>
                    {!isIPhone && !isLowPerformance && (
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary-blue/10 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                    )}
                    
                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary-blue mb-4">
                            <MessageCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-heading mb-2">{callToActionText}</h3>
                        <p className="text-sm text-gray mb-6">
                            Can't find the answer you're looking for? Please chat to our friendly team.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-blue transition-colors shadow-md flex items-center justify-center gap-2">
                                Get in Touch
                            </button>
                            <div className="flex items-center justify-center gap-2 text-sm text-heading font-medium">
                                <Phone className="w-4 h-4 text-primary-blue" />
                                <span>{phoneNumber}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
          </div>

          {/* Right Column: Accordion Items */}
          <div className="lg:w-2/3 w-full">
            <div className="space-y-4">
              {faqItems.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    onClick={() => toggleItem(index)}
                    className={cn(
                      "group rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden",
                      isOpen
                        ? "bg-white border-primary-blue/30 shadow-lg shadow-zinc-100/50"
                        : isIPhone || isLowPerformance 
                          ? "bg-white border-gray-100 shadow-sm"
                          : "bg-white/40 border-white/60 hover:bg-white/60 hover:border-white shadow-sm hover:shadow-md"
                    )}
                  >
                    <div className="flex items-center justify-between px-6 py-5">
                      <h3
                        className={cn(
                          "text-lg font-semibold transition-colors duration-300",
                          isOpen ? "text-primary-blue" : "text-heading group-hover:text-primary-blue"
                        )}
                      >
                        {item.title}
                      </h3>
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300",
                          isOpen
                            ? "bg-primary-blue text-white rotate-180"
                            : "bg-white text-gray shadow-sm group-hover:text-primary-blue"
                        )}
                      >
                         {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </div>
                    </div>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <div className="px-6 pb-6 pt-0">
                            <p className="text-gray leading-relaxed">
                              {item.content}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqAccordion;

