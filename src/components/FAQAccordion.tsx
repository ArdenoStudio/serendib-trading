import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const serendibFaqs = [
  { 
    question: "Do you accept vehicle exchanges?", 
    answer: "Yes. We can review your current vehicle, check condition and market pricing, then share a clear trade-in offer against the vehicle you want next."
  },
  {
    question: "What financing options are available for premium vehicles?",
    answer: "We work with leading Sri Lankan finance partners, including Sampath Bank, HNB, and Commercial Bank. Our team can help you compare leasing terms, down payments, and monthly commitments before you decide."
  },
  { 
    question: "Can I verify the vehicle history and mileage?", 
    answer: "Yes. Available documents such as JAAI/HPI reports, auction sheets, service history, and mileage records can be reviewed before purchase. Independent inspections are welcome."
  },
  {
    question: "Do you offer doorstep delivery throughout Sri Lanka?",
    answer: "Yes. We can arrange islandwide delivery after the vehicle is inspected, detailed, and documented. We also assist with RMV registration, insurance paperwork, and handover coordination."
  }
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {serendibFaqs.map((faq, index) => (
        <div
          key={index}
          className={`overflow-hidden rounded-3xl transition-[border-color,background-color,box-shadow] duration-500 border ${
            openIndex === index 
            ? 'bg-white/[0.04] border-[#D4AF37]/40 shadow-[0_20px_50px_-15px_rgba(212,175,55,0.1)]' 
            : 'bg-white/[0.02] border-white/5 hover:border-white/10'
          }`}
        >
          <button 
            onClick={() => setOpenIndex(openIndex === index ? null : index)} 
            aria-expanded={openIndex === index}
            aria-controls={`faq-panel-${index}`}
            id={`faq-button-${index}`}
            className="w-full px-6 md:px-10 py-6 md:py-8 flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0b09] group active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-4">
                <HelpCircle className={`w-5 h-5 transition-colors duration-500 ${openIndex === index ? 'text-[#D4AF37]' : 'text-gray-600'}`} />
                <span className={`text-base font-semibold tracking-tight transition-colors duration-500 ${openIndex === index ? 'text-white' : 'text-white/60 group-hover:text-white/80'}`}>
                {faq.question}
                </span>
            </div>
            <motion.div 
                animate={{ rotate: openIndex === index ? 180 : 0 }} 
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} 
                className={`shrink-0 ml-4 ${openIndex === index ? 'text-[#D4AF37]' : 'text-gray-600'}`}
            >
              <ChevronDown className="w-6 h-6" />
            </motion.div>
          </button>
          <AnimatePresence>
            {openIndex === index && (
              <motion.div 
                id={`faq-panel-${index}`}
                role="region"
                aria-labelledby={`faq-button-${index}`}
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: "auto", opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }} 
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="px-6 md:px-10 pb-8 md:pb-10">
                    <div className="pt-6 border-t border-white/5 text-base leading-relaxed font-medium text-gray-400 max-w-3xl">
                        {faq.answer}
                    </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
