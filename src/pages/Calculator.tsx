import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedHeading from '../components/AnimatedHeading';
import LoanCalculator from '../components/LoanCalculator';
import WhatsAppFloat from '../components/WhatsAppFloat';

export default function Calculator() {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#000000', color: '#FFFFFF' }}>
      <Navbar />
      <div className="pt-40 pb-24 px-6 lg:px-10 max-w-[1400px] mx-auto">
        <AnimatedHeading eyebrow="Plan Your Purchase" align="center">Finance Calculator</AnimatedHeading>
        <p className="max-w-xl mx-auto text-center mb-16 -mt-4 font-medium" style={{ color: '#A1A1AA', fontSize: '16px', lineHeight: 1.7 }}>
          Estimate your monthly instalments based on vehicle price, down payment, and loan term.
        </p>

        <LoanCalculator />
      </div>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
