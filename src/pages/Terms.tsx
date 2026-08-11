import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const sections = [
  {
    title: 'About Serendib Trading',
    body: 'Serendib Trading is a vehicle importer and showroom based at 47/A, S. De S. Jayasinghe Mawatha, Dehiwala-Mount Lavinia, Sri Lanka. You can reach us at bilalikras1@gmail.com or +94 75 636 3427.',
  },
  {
    title: 'Use of Website',
    body: 'By accessing this website, you agree to use it only for lawful purposes. You must not misuse this site by introducing viruses, attempting to gain unauthorised access, or engaging in any conduct that disrupts or damages the service.',
  },
  {
    title: 'Vehicle Information & Pricing',
    body: 'All vehicle listings, specifications, images, and pricing displayed on this website are provided for informational purposes only and may change without notice. Vehicles are imported used vehicles; while we review the documents and condition available to us, we make no guarantee regarding any specific vehicle\'s condition, mileage accuracy, accident history, or origin beyond what is stated in the listing and confirmed in writing at the time of sale. Final prices are confirmed at the time of sale, and we reserve the right to correct errors or inaccuracies.',
  },
  {
    title: 'Finance Guidance Disclaimer',
    body: 'Any finance or loan calculator figures shown on this website are estimates for planning purposes only. They do not constitute financial advice, a loan offer, or a guarantee of approval or terms. Actual rates and eligibility are determined solely by the relevant financial institution.',
  },
  {
    title: 'No Contractual Obligation',
    body: 'Browsing our inventory or submitting an inquiry does not constitute a binding agreement or reservation. Vehicles remain available for sale until a formal sale agreement has been executed and a deposit received.',
  },
  {
    title: 'Intellectual Property',
    body: 'All content on this website — including images, text, logos, and design — is the property of Serendib Trading or its content suppliers. Unauthorised reproduction or use of this content is prohibited.',
  },
  {
    title: 'Limitation of Liability',
    body: 'Serendib Trading shall not be liable for any indirect, incidental, or consequential damages arising from the use of this website or the information contained herein. We make no warranties, expressed or implied, regarding the accuracy or completeness of any information provided.',
  },
  {
    title: 'Governing Law',
    body: 'These terms are governed by and construed in accordance with the laws of Sri Lanka. Any disputes arising from these terms or your use of this website shall be subject to the exclusive jurisdiction of the courts of Sri Lanka.',
  },
  {
    title: 'Changes to Terms',
    body: 'Serendib Trading reserves the right to modify these Terms of Service at any time without prior notice. Continued use of the website after any modifications constitutes your acceptance of the updated terms.',
  },
];

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#0d0b09] text-white font-sans overflow-x-hidden selection:bg-[#D4AF37] selection:text-black">
      <SEO
        title="Terms of Service"
        description="Serendib Trading's website terms of service for vehicle listing information, inquiries, pricing, and site use."
        canonical="/terms"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Terms of Service', path: '/terms' },
        ]}
      />
      <main className="pt-40 pb-20 px-6 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-16"
        >
          {/* Header */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-[1px] bg-white/20" />
              <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#D4AF37]">Legal</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-[-0.05em] leading-none">
              Terms of Service
            </h1>
            <p className="text-white/50 text-sm">Last updated: {new Date().getFullYear()}</p>
          </div>

          <p className="text-white/70 text-base leading-relaxed">
            Please read these Terms of Service carefully before using the <strong className="text-white">Serendib Trading</strong> website. By accessing or using our site, you agree to be bound by these terms.
          </p>

          {/* Sections */}
          <div className="space-y-12">
            {sections.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="space-y-3 pb-12 border-b border-white/5 last:border-0"
              >
                <h2 className="text-lg font-bold text-white tracking-tight">{s.title}</h2>
                <p className="text-white/60 text-base leading-relaxed font-normal">{s.body}</p>
              </motion.div>
            ))}
          </div>

          <div className="pt-8">
            <Link
              to="/"
              className="inline-flex items-center gap-3 text-[13px] font-bold text-[#D4AF37] hover:text-white transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
