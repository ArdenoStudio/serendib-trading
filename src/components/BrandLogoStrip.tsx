import { motion } from 'framer-motion';

export default function BrandLogoStrip() {
  const brands = [
    { name: 'Mercedes', short: 'MB' },
    { name: 'BMW', short: 'BMW' },
    { name: 'Audi', short: 'AUDI' },
    { name: 'Toyota', short: 'TOY' },
    { name: 'Honda', short: 'HON' },
    { name: 'Nissan', short: 'NIS' }
  ];

  return (
    <div
      className="w-full py-16 overflow-hidden relative"
      style={{
        backgroundColor: '#000000',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <h3 className="text-center text-[13px] tracking-widest uppercase font-bold text-[#A1A1AA] mb-10">Browse by Make</h3>
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {brands.map((brand, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.3 }}
              className="w-24 h-24 rounded-full flex flex-col items-center justify-center cursor-pointer shadow-lg"
              style={{
                backgroundColor: '#111111',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <span className="text-[16px] font-extrabold text-[#FFFFFF]">{brand.short}</span>
              <span className="text-[10px] mt-1 tracking-widest uppercase text-[#A1A1AA]">{brand.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
