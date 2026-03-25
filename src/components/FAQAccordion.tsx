import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { question: "Do you accept vehicle exchanges?", answer: "Yes! We welcome trade-ins and exchanges. The value offered depends on the condition and market value of your vehicle. Contact us to arrange an evaluation." },
  { question: "What financing options do you offer?", answer: "We partner with leading banks in Sri Lanka to offer flexible financing options with competitive interest rates. Our team will assist you in securing a loan that fits your budget, with terms up to 60 months." },
  { question: "Can I schedule a test drive?", answer: "Absolutely. We encourage test drives to ensure you find the perfect vehicle. Please contact us via WhatsApp or phone to schedule an appointment at your convenience." },
  { question: "Do you provide after-sales support?", answer: "Yes, we pride ourselves on our after-sales service. We offer comprehensive warranties on select vehicles and have a dedicated team to assist with any maintenance or service needs." }
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="w-full max-w-4xl space-y-4">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl transition-all duration-200"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E9ECEF',
            boxShadow: openIndex === index ? '0 10px 30px -10px rgba(0,0,0,0.08)' : 'box-shadow: 0 4px 6px rgba(0,0,0,0.02)',
          }}
        >
          <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className="w-full px-8 py-6 flex items-center justify-between text-left focus:outline-none">
            <span className="text-[16px] font-bold transition-colors duration-200" style={{ color: openIndex === index ? '#D4AF37' : '#0A1128' }}>
              {faq.question}
            </span>
            <motion.div animate={{ rotate: openIndex === index ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0 ml-4" style={{ color: '#A3A8AE' }}>
              <ChevronDown className="w-6 h-6" />
            </motion.div>
          </button>
          <AnimatePresence>
            {openIndex === index && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                <div className="px-8 pb-8 text-[15px] leading-relaxed font-medium" style={{ color: '#6C757D', borderTop: '1px solid #F8F9FA' }}>
                  <div className="pt-4">{faq.answer}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
