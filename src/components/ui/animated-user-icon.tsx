'use client';

import { motion, useAnimation, type Variants } from 'framer-motion';

type AnimatedUserIconProps = {
  size?: number;
  className?: string;
  strokeWidth?: number;
};

export const AnimatedUserIcon = ({ size = 20, className, strokeWidth = 2 }: AnimatedUserIconProps) => {
  const controls = useAnimation();

  const handleMouseEnter = () => {
    controls.start('animate');
  };

  const handleMouseLeave = () => {
    controls.start('initial');
  };

  const variants: { path: Variants; circle: Variants } = {
    path: {
      initial: {
        pathLength: 1,
        pathOffset: 0,
        opacity: 1,
        y: 0
      },
      animate: {
        pathLength: [0, 1],
        pathOffset: [0, 1],
        opacity: [0, 1],
        y: [0, 1, -1, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
    circle: {
      initial: {
        pathLength: 1,
        pathOffset: 0,
        opacity: 1,
        y: 0
      },
      animate: {
        pathLength: [0, 1],
        pathOffset: [0, 1],
        opacity: [0, 1],
        y: [0, 2, -1, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
          delay: 0.1,
        },
      },
    },
  };

  return (
    <div 
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.path
          d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"
          variants={variants.path}
          initial="initial"
          animate={controls}
        />
        <motion.circle
          cx={12}
          cy={7}
          r={4}
          variants={variants.circle}
          initial="initial"
          animate={controls}
        />
      </motion.svg>
    </div>
  );
};
