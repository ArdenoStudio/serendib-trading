import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppFloat() {
  return (
    <a href="https://wa.me/94756363427" target="_blank" rel="noopener noreferrer" className="fixed bottom-8 right-8 z-50">
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-16 h-16 flex items-center justify-center rounded-full shadow-2xl"
        style={{ backgroundColor: '#25D366' }}
      >
        <MessageCircle className="text-white w-8 h-8" />
      </motion.div>
    </a>
  );
}
