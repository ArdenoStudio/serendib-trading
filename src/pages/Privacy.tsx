import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const sections = [
  {
    title: 'Who We Are',
    body: 'Serendib Trading is a vehicle importer and showroom based at 47/A, S. De S. Jayasinghe Mawatha, Dehiwala-Mount Lavinia, Sri Lanka. For any privacy request, contact us at bilalikras1@gmail.com or call +94 75 636 3427.',
  },
  {
    title: 'Information We Collect',
    body: 'When you submit an inquiry, book a viewing or test drive, or contact us through WhatsApp, we collect only what you choose to share: your name, phone number, preferred viewing date/time, and the details of your inquiry (including any vehicle you ask about). We do not collect payment information, and our contact forms collect no email address. If you contact us by phone or in person, the same categories of information apply.',
  },
  {
    title: 'How We Use Your Information (Lawful Basis)',
    body: 'We process your personal data to respond to your inquiry and arrange viewings or test drives — this is our legitimate business interest, and where you consent (for example by ticking the consent box on our forms) we rely on that consent, which you may withdraw at any time. We never sell or rent your personal information, and we do not use it for marketing unless you have separately asked to be contacted.',
  },
  {
    title: 'How We Store & Process Your Data',
    body: 'Your details are stored in secure, industry-standard systems. Depending on how you contact us, your data may be processed by: Serendib Trading (Sri Lanka), WhatsApp / Meta (for continuing conversations you choose to start), Google (OAuth sign-in for our internal admin, and Maps), Vercel and Neon (our hosting and database providers). These processors act on our instructions and are used solely to operate this website and respond to you.',
  },
  {
    title: 'Data Retention',
    body: 'We keep inquiry and booking records only as long as needed to handle your request and for our legitimate business records (typically up to 24 months after the last contact). Analytics records are retained for a shorter period and are not used to identify you. You may ask us to delete your data at any time using the contact details above.',
  },
  {
    title: 'Your Rights',
    body: 'Subject to applicable law (including Sri Lanka\'s Personal Data Protection Act No. 9 of 2022), you have the right to access, correct, or erase your personal data, to object to or restrict processing, to withdraw consent, and to lodge a complaint with the Data Protection Authority of Sri Lanka. To exercise any of these rights, email bilalikras1@gmail.com with the subject "Privacy Request" — we respond within 30 days.',
  },
  {
    title: 'WhatsApp Handover',
    body: 'When you choose to "Continue on WhatsApp", the name and phone number you entered on our form are pre-filled into a WhatsApp message to us. That conversation then takes place on WhatsApp under Meta\'s privacy policy, which you can review at whatsapp.com/legal. You are never required to continue on WhatsApp; you may call us directly instead.',
  },
  {
    title: 'Cookies & Analytics',
    body: 'We use Vercel Analytics and our own lightweight page-view logging to understand how visitors use the site (pages viewed, referrer, and browser type). This data is aggregated and is not used to identify you. We do not use advertising or cross-site tracking cookies.',
  },
  {
    title: 'Third-Party Links',
    body: 'Our site contains links to third-party platforms such as WhatsApp, Instagram, and Google Maps. We are not responsible for the privacy practices of these external services and encourage you to review their respective policies.',
  },
  {
    title: 'Children',
    body: 'Our website and services are intended for adults aged 18 and over. We do not knowingly collect personal data from children.',
  },
  {
    title: 'Changes to This Policy',
    body: 'We may update this policy from time to time. The latest version will always be available on this page with its effective date. Significant changes will be highlighted when you next visit.',
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
            <p className="text-white/50 text-sm">Effective: 19 August 2026</p>
          </div>

          <p className="text-white/70 text-base leading-relaxed">
            At <strong className="text-white">Serendib Trading</strong>, we respect your privacy and are committed to protecting your personal data. This policy explains what information we collect, why, how long we keep it, and the rights you have over it.
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
