import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  { 
    question: "Do you accept vehicle exchanges?", 
    answer: "Yes, we facilitate professional trade-ins. Every exchange vehicle undergoes a transparent market valuation by our appraisal head to ensure you receive a fair and competitive offer against your new Serendib acquisition." 
  },
  { 
    question: "What financing options are available for premium vehicles?", 
    answer: "We maintain strategic partnerships with Sri Lanka's leading financial institutions including Sampath Bank, HNB, and Commercial Bank. We offer bespoke lease structures with competitive rates and terms extended up to 7 years for qualifying clients." 
  },
  { 
    question: "Can I verify the vehicle history and mileage?", 
    answer: "Absolute transparency is our hallmark. Every vehicle in our showroom is accompanied by its original JAAI/HPI certification and full maintenance logs from its country of origin (UK/Japan). We welcome independent inspections at any certified facility." 
  },
  { 
    question: "Do you offer doorstep delivery throughout Sri Lanka?", 
    answer: "Yes, our Concierge Delivery service ensures your vehicle arrives at your residence in showroom condition. We handle the entire RMV registration process, insurance documentation, and final detailing prior to handover." 
  }
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className={`overflow-hidden rounded-3xl transition-all duration-500 border ${
            openIndex === index 
            ? 'bg-white/[0.04] border-[#D4AF37]/40 shadow-[0_20px_50px_-15px_rgba(212,175,55,0.1)]' 
            : 'bg-white/[0.02] border-white/5 hover:border-white/10'
          }`}
        >
          <button 
            onClick={() => setOpenIndex(openIndex === index ? null : index)} 
            className="w-full px-10 py-8 flex items-center justify-between text-left focus:outline-none group"
          >
            <div className="flex items-center gap-4">
                <HelpCircle className={`w-5 h-5 transition-colors duration-500 ${openIndex === index ? 'text-[#D4AF37]' : 'text-gray-600'}`} />
                <span className={`text-lg font-black italic uppercase tracking-tighter transition-colors duration-500 ${openIndex === index ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
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
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: "auto", opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }} 
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="px-10 pb-10">
                    <div className="pt-6 border-t border-white/5 text-[15px] leading-relaxed font-medium text-gray-400 max-w-3xl">
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
