import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface CarCardProps {
  car: {
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    mileage: number;
    fuel: string;
    transmission: string;
    image: string;
    condition: string;
  };
  className?: string;
}

export default function CarCard({ car, className = '' }: CarCardProps) {
  const formattedPrice = `LKR${car.price.toLocaleString()}`;

  return (
    <Link to={`/car/${car.id}`} className={`block group ${className}`}>
      <motion.div
        whileHover="hover"
        className="overflow-hidden transition-all duration-300 rounded-xl bg-[#111111] shadow-[0_10px_40px_rgba(0,0,0,0.4)] hover:-translate-y-1"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <motion.div
            variants={{ hover: { scale: 1.1 } }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
            <img
              src={car.image}
              alt={`${car.make} ${car.model}`}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          {/* Condition badge — top left */}
          {car.condition && (
            <div
              className="absolute top-3 left-3 rounded-md"
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                padding: '4px 10px',
                backgroundColor: car.condition.toUpperCase() === 'NEW'
                  ? '#D4AF37'
                  : '#0A1128',
                color: car.condition.toUpperCase() === 'NEW'
                  ? '#0A1128'
                  : '#FFFFFF',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                textTransform: 'uppercase',
              }}
            >
              {car.condition}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-5 pt-6">
          <h3
            className="text-[16px] font-semibold mb-1 truncate"
            style={{ color: '#FFFFFF' }}
          >
            {car.make} {car.model}
          </h3>
          <p
            className="text-[20px] font-bold mb-4"
            style={{ color: '#FFFFFF' }}
          >
            {formattedPrice}
          </p>

          {/* Specs row */}
          <div className="flex items-center gap-3 text-[13px] font-medium" style={{ color: '#A1A1AA' }}>
            <span
              className="px-2 py-0.5 rounded"
              style={{
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                color: '#D4AF37',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {car.year}
            </span>
            <span>{car.mileage.toLocaleString()}km</span>
            <span>{car.transmission}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
