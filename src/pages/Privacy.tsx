import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const sections = [
  {
    title: 'Information We Collect',
    body: 'When you use our website or contact us, we may collect your name, phone number, email address, and vehicle inquiry details. This information is provided voluntarily by you when submitting contact forms or booking test drives.',
  },
  {
    title: 'How We Use Your Information',
    body: 'We use the information you provide solely to respond to your inquiries, process test drive bookings, and share relevant vehicle information. We do not sell or rent your personal information to any third parties.',
  },
  {
    title: 'Data Storage & Security',
    body: 'Your data is securely stored and processed through industry-standard services. We retain contact information only as long as necessary to fulfil your inquiry and for legitimate business purposes.',
  },
  {
    title: 'Cookies & Analytics',
    body: 'Our website uses analytics tools to understand how visitors interact with the site. This data is aggregated and anonymous. You may disable cookies through your browser settings at any time.',
  },
  {
    title: 'Third-Party Links',
    body: 'Our site contains links to third-party platforms such as WhatsApp and Google Maps. We are not responsible for the privacy practices of these external services and encourage you to review their respective policies.',
  },
  {
    title: 'Contact Us',
    body: 'If you have any questions about this Privacy Policy or your personal data, please contact us at bilalikras1@gmail.com or call +94 75 636 3427.',
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#0d0b09] text-white font-sans overflow-x-hidden selection:bg-[#D4AF37] selection:text-black">
      <SEO
        title="Privacy Policy"
        description="Serendib Trading's privacy policy explaining how we collect, use, and protect vehicle inquiry and contact information."
        canonical="/privacy"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Privacy Policy', path: '/privacy' },
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
              Privacy Policy
            </h1>
            <p className="text-white/50 text-sm">Last updated: {new Date().getFullYear()}</p>
          </div>

          <p className="text-white/70 text-base leading-relaxed">
            At <strong className="text-white">Serendib Trading</strong>, we respect your privacy and are committed to protecting your personal data. This policy outlines what information we collect and how we use it.
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
