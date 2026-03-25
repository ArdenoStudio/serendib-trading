import { motion } from 'framer-motion';

interface BodyTypeTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = ['All', 'Sedan', 'SUV', 'Hatchback', 'Van', 'Pick-up'];

export default function BodyTypeTabs({ activeTab, onTabChange }: BodyTypeTabsProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-12">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className="relative px-6 py-2 text-xs tracking-[0.1em] uppercase transition-colors duration-200"
          style={{
            color: activeTab === tab ? '#0A1128' : 'rgba(33, 37, 41, 0.6)',
          }}
          onMouseEnter={(e) => {
            if (activeTab !== tab) (e.currentTarget as HTMLElement).style.color = '#D4AF37';
          }}
          onMouseLeave={(e) => {
            if (activeTab !== tab) (e.currentTarget as HTMLElement).style.color = 'rgba(33, 37, 41, 0.6)';
          }}
        >
          {activeTab === tab && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0"
              style={{ background: 'linear-gradient(135deg, #C9A227, #E8C84A, #A07C10)' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">{tab}</span>
        </button>
      ))}
    </div>
  );
}
