import type { CSSProperties, ReactNode } from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {
  ArrowRight,
  CreditCard,
  FileCheck,
  Gauge,
  Globe,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

// Heavy Remotion-only JPG plates live outside public/ so the website deploy stays light.
import showroomFloor01 from './assets/showroom/serendib-showroom-floor-01.jpg';
import showroomFloor02 from './assets/showroom/serendib-showroom-floor-02.jpg';
import showroomFloor03 from './assets/showroom/serendib-showroom-floor-03.jpg';
import showroomFloor06 from './assets/showroom/serendib-showroom-floor-06.jpg';
import showroomLogoWall from './assets/showroom/serendib-logo-wall.jpg';

const BG = '#0d0b09';
const GOLD = '#D4AF37';
const GOLD_LIGHT = '#F3D67E';
const WHITE = '#FFFFFF';
const MUTED = 'rgba(255,255,255,0.62)';
const PANEL = 'rgba(255,255,255,0.045)';
const STROKE = 'rgba(255,255,255,0.11)';
const FONT_SANS = '"Outfit", "Inter", "Segoe UI", Arial, sans-serif';
const FONT_SERIF = '"Cormorant Garamond", Georgia, serif';

type CarInfo = {
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  bodyType: string;
  image: string;
  condition: string;
};

const cars: CarInfo[] = [
  {
    make: 'Toyota',
    model: 'Land Cruiser Prado',
    year: 2021,
    price: 48500000,
    mileage: 32000,
    bodyType: 'SUV',
    image: '/images/gallery/vehicle-1.webp',
    condition: 'Registered',
  },
  {
    make: 'BMW',
    model: '520d M Sport',
    year: 2018,
    price: 29500000,
    mileage: 58000,
    bodyType: 'Sedan',
    image: '/images/gallery/vehicle-4.webp',
    condition: 'Registered',
  },
  {
    make: 'Honda',
    model: 'Vezel Hybrid Z',
    year: 2020,
    price: 18500000,
    mileage: 41000,
    bodyType: 'Crossover',
    image: '/images/gallery/vehicle-7.webp',
    condition: 'Registered',
  },
  {
    make: 'Land Rover',
    model: 'Range Rover Vogue',
    year: 2019,
    price: 72500000,
    mileage: 36000,
    bodyType: 'SUV',
    image: '/images/gallery/vehicle-10.webp',
    condition: 'Reconditioned',
  },
  {
    make: 'Toyota',
    model: 'Aqua Hybrid',
    year: 2022,
    price: 16200000,
    mileage: 19000,
    bodyType: 'Hatchback',
    image: '/images/gallery/vehicle-13.webp',
    condition: 'Reconditioned',
  },
  {
    make: 'Mercedes-Benz',
    model: 'C200 AMG Line',
    year: 2020,
    price: 34500000,
    mileage: 27000,
    bodyType: 'Sedan',
    image: '/images/gallery/vehicle-16.webp',
    condition: 'Registered',
  },
];

const bodyTypes = [
  { name: 'SUV', image: '/car-types/suv.webp' },
  { name: 'Sedan', image: '/car-types/sedan.webp' },
  { name: 'Hatchback', image: '/car-types/hatchback.webp' },
  { name: 'Luxury', image: '/car-types/rolls-royce.webp' },
  { name: 'MPV', image: '/car-types/car.webp' },
  { name: 'Crossover', image: '/car-types/crossover.webp' },
];

const brandLogos = [
  { name: 'Toyota', image: '/brand-logos/toyota.svg' },
  { name: 'Honda', image: '/brand-logos/honda.svg' },
  { name: 'Suzuki', image: '/brand-logos/suzuki.svg' },
  { name: 'Nissan', image: '/brand-logos/nissan.svg' },
  { name: 'Mitsubishi', image: '/brand-logos/mitsubishi.svg' },
  { name: 'Mercedes', image: '/brand-logos/mercedes.svg' },
  { name: 'Land Rover', image: '/brand-logos/land-rover.png' },
];

const values = [
  {
    title: 'Direct Global Imports',
    body: 'Sourced from trusted partners in the UK and Japan.',
    Icon: Globe,
  },
  {
    title: '100% Verified Mileage',
    body: 'Authentic mileage backed by documented vehicle histories.',
    Icon: Gauge,
  },
  {
    title: 'Premium Finance',
    body: 'Flexible leasing and finance paths tailored to each buyer.',
    Icon: CreditCard,
  },
  {
    title: 'Hassle-Free RMV',
    body: 'Clearance, registration, and documentation handled cleanly.',
    Icon: FileCheck,
  },
];

const REMOTION_LOCAL_ASSETS: Record<string, string> = {
  '/images/showroom/serendib-showroom-floor-01.jpg': showroomFloor01,
  '/images/showroom/serendib-showroom-floor-02.jpg': showroomFloor02,
  '/images/showroom/serendib-showroom-floor-03.jpg': showroomFloor03,
  '/images/showroom/serendib-showroom-floor-06.jpg': showroomFloor06,
  '/images/showroom/serendib-logo-wall.jpg': showroomLogoWall,
};

const pathFor = (path: string) =>
  REMOTION_LOCAL_ASSETS[path] || staticFile(path.replace(/^\/+/, ''));

const clamp = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeInOut = Easing.bezier(0.45, 0, 0.55, 1);

const fadeInOut = (frame: number, start: number, end: number, fade = 24) =>
  interpolate(frame, [start, start + fade, end - fade, end], [0, 1, 1, 0], clamp);

const progress = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    easing: easeOut,
    ...clamp,
  });

const millions = (price: number) => `LKR ${(price / 1000000).toFixed(1)}M`;

const textStyle = (size: number, weight = 800): CSSProperties => ({
  color: WHITE,
  fontFamily: FONT_SANS,
  fontSize: size,
  fontWeight: weight,
  lineHeight: 1,
  letterSpacing: 0,
});

const ImageFill = ({
  src,
  opacity = 1,
  style,
  objectPosition = 'center center',
}: {
  src: string;
  opacity?: number;
  style?: CSSProperties;
  objectPosition?: CSSProperties['objectPosition'];
}) => (
  <Img
    src={pathFor(src)}
    style={{
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition,
      opacity,
      ...style,
    }}
  />
);

const Logo = ({ style }: { style?: CSSProperties }) => (
  <Img
    src={pathFor('/serendib-logo.png')}
    style={{
      width: 260,
      height: 170,
      objectFit: 'contain',
      filter: 'drop-shadow(0 18px 38px rgba(0,0,0,0.55))',
      ...style,
    }}
  />
);

const FineGrid = ({ opacity = 0.12 }: { opacity?: number }) => (
  <AbsoluteFill style={{ opacity, pointerEvents: 'none' }}>
    {Array.from({ length: 26 }).map((_, index) => (
      <div
        key={`h-${index}`}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: index * 44,
          height: 1,
          background: 'rgba(255,255,255,0.08)',
        }}
      />
    ))}
    {Array.from({ length: 44 }).map((_, index) => (
      <div
        key={`v-${index}`}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: index * 44,
          width: 1,
          background: 'rgba(255,255,255,0.05)',
        }}
      />
    ))}
  </AbsoluteFill>
);

const ScanLines = ({ frame, opacity = 0.12 }: { frame: number; opacity?: number }) => (
  <AbsoluteFill style={{ opacity, pointerEvents: 'none' }}>
    {Array.from({ length: 42 }).map((_, index) => {
      const y = ((index * 31 + frame * 1.6) % 1080) - 12;
      return (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: y,
            height: index % 7 === 0 ? 2 : 1,
            background: index % 7 === 0 ? 'rgba(212,175,55,0.18)' : 'rgba(255,255,255,0.08)',
          }}
        />
      );
    })}
  </AbsoluteFill>
);

const GoldRail = ({ frame }: { frame: number }) => {
  const x = interpolate(frame % 140, [0, 140], [-260, 2180], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        top: 76,
        left: x,
        width: 220,
        height: 2,
        background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
        opacity: 0.8,
      }}
    />
  );
};

const CornerFrame = ({ opacity = 1 }: { opacity?: number }) => (
  <AbsoluteFill style={{ pointerEvents: 'none', opacity }}>
    {[
      { top: 62, left: 70, borderTop: true, borderLeft: true },
      { top: 62, right: 70, borderTop: true, borderRight: true },
      { bottom: 62, left: 70, borderBottom: true, borderLeft: true },
      { bottom: 62, right: 70, borderBottom: true, borderRight: true },
    ].map((item, index) => (
      <div
        key={index}
        style={{
          position: 'absolute',
          width: 110,
          height: 110,
          borderColor: 'rgba(212,175,55,0.44)',
          borderStyle: 'solid',
          borderWidth: 0,
          ...(item.borderTop ? { borderTopWidth: 2 } : {}),
          ...(item.borderBottom ? { borderBottomWidth: 2 } : {}),
          ...(item.borderLeft ? { borderLeftWidth: 2 } : {}),
          ...(item.borderRight ? { borderRightWidth: 2 } : {}),
          ...item,
        }}
      />
    ))}
  </AbsoluteFill>
);

const GlitchText = ({
  text,
  frame,
  active,
  style,
}: {
  text: string;
  frame: number;
  active: number;
  style?: CSSProperties;
}) => {
  const pulse = active * (frame % 14 < 5 ? 1 : 0.22);
  const offsetA = Math.sin(frame * 1.7) * 8 * pulse;
  const offsetB = Math.cos(frame * 1.1) * 10 * pulse;

  return (
    <div style={{ position: 'relative', display: 'inline-block', ...style }}>
      <span style={{ position: 'relative', zIndex: 4 }}>{text}</span>
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          color: '#38f2d0',
          opacity: 0.5 * pulse,
          transform: `translate(${offsetA}px, ${-2 * pulse}px)`,
          mixBlendMode: 'screen',
        }}
      >
        {text}
      </span>
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 3,
          color: '#ff3f63',
          opacity: 0.42 * pulse,
          transform: `translate(${offsetB}px, ${2 * pulse}px)`,
          mixBlendMode: 'screen',
        }}
      >
        {text}
      </span>
      {Array.from({ length: 7 }).map((_, index) => {
        const top = index * 14;
        const shift = (((frame * 19 + index * 31) % 29) - 14) * pulse;
        return (
          <span
            key={index}
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 5,
              opacity: 0.3 * pulse,
              color: index % 2 === 0 ? WHITE : GOLD_LIGHT,
              clipPath: `inset(${top}% 0 ${100 - top - 8}% 0)`,
              transform: `translateX(${shift}px)`,
            }}
          >
            {text}
          </span>
        );
      })}
    </div>
  );
};

const TelemetryStack = ({ frame, opacity }: { frame: number; opacity: number }) => {
  const rows = ['UK IMPORTS', 'JAPAN STOCK', 'VERIFIED MILEAGE', 'PREMIUM FINANCE', 'RMV SUPPORT'];
  return (
    <div
      style={{
        position: 'absolute',
        right: 96,
        top: 140,
        width: 310,
        opacity,
        fontFamily: FONT_SANS,
      }}
    >
      {rows.map((row, index) => {
        const value = 61 + ((frame * (index + 3) + index * 17) % 39);
        return (
          <div
            key={row}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 70px',
              gap: 18,
              alignItems: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              padding: '16px 0',
              color: index % 2 === 0 ? 'rgba(255,255,255,0.76)' : GOLD_LIGHT,
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: 1.4,
              textTransform: 'uppercase',
            }}
          >
            <span>{row}</span>
            <span style={{ color: WHITE, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{value}%</span>
          </div>
        );
      })}
    </div>
  );
};

const TeaserImageLayer = ({
  frame,
  src,
  start,
  end,
  objectPosition,
}: {
  frame: number;
  src: string;
  start: number;
  end: number;
  objectPosition?: CSSProperties['objectPosition'];
}) => {
  const opacity = fadeInOut(frame, start, end, 28);
  const p = progress(frame, start, end);
  const glitch = opacity * (frame % 18 < 4 ? 1 : 0);
  return (
    <AbsoluteFill style={{ opacity }}>
      <ImageFill
        src={src}
        objectPosition={objectPosition}
        style={{
          transform: `scale(${1.08 + p * 0.08}) translateX(${(p - 0.5) * 46}px)`,
          filter: `brightness(${0.54 + opacity * 0.26}) contrast(1.14) saturate(1.02)`,
        }}
      />
      {glitch > 0 && (
        <ImageFill
          src={src}
          objectPosition={objectPosition}
          opacity={0.22 * glitch}
          style={{
            transform: `scale(${1.08 + p * 0.08}) translateX(${Math.sin(frame) * 22}px)`,
            filter: 'hue-rotate(28deg) saturate(1.6) contrast(1.35)',
            clipPath: `inset(${18 + (frame % 9)}% 0 ${44 - (frame % 11)}% 0)`,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

const TeaserIntroCopy = ({ frame }: { frame: number }) => {
  const opacity = fadeInOut(frame, 0, 160, 28);
  const p = progress(frame, 8, 110);
  return (
    <div
      style={{
        position: 'absolute',
        left: 140,
        bottom: 145,
        width: 760,
        opacity,
        transform: `translateY(${interpolate(p, [0, 1], [24, 0])}px)`,
        fontFamily: FONT_SANS,
      }}
    >
      <div
        style={{
          color: GOLD,
          fontSize: 17,
          fontWeight: 900,
          letterSpacing: 4,
          textTransform: 'uppercase',
          marginBottom: 22,
        }}
      >
        New website signal detected
      </div>
      <div style={{ ...textStyle(72, 900), textTransform: 'uppercase', lineHeight: 0.96 }}>
        A new digital showroom is arriving.
      </div>
      <div
        style={{
          width: 360,
          height: 3,
          background: `linear-gradient(90deg, ${GOLD}, transparent)`,
          marginTop: 36,
        }}
      />
    </div>
  );
};

const TeaserMainTitle = ({ frame }: { frame: number }) => {
  const opacity = fadeInOut(frame, 104, 292, 24);
  const p = progress(frame, 108, 172);
  const active = opacity * (frame < 172 || (frame > 248 && frame < 278) ? 1 : 0.25);

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 330,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity,
        transform: `scale(${interpolate(p, [0, 1], [0.92, 1])})`,
        fontFamily: FONT_SANS,
        textAlign: 'center',
      }}
    >
      <GlitchText
        text="SERENDIB"
        frame={frame}
        active={active}
        style={{
          ...textStyle(138, 950),
          textTransform: 'uppercase',
          lineHeight: 0.9,
        }}
      />
      <GlitchText
        text="TRADING"
        frame={frame + 11}
        active={active}
        style={{
          ...textStyle(116, 950),
          color: GOLD_LIGHT,
          textTransform: 'uppercase',
          lineHeight: 0.9,
        }}
      />
      <div
        style={{
          marginTop: 38,
          color: 'rgba(255,255,255,0.68)',
          fontSize: 19,
          fontWeight: 800,
          letterSpacing: 5,
          textTransform: 'uppercase',
        }}
      >
        Luxury vehicles. Verified histories. Cleaner discovery.
      </div>
    </div>
  );
};

const TeaserDriveCopy = ({ frame }: { frame: number }) => {
  const opacity = fadeInOut(frame, 236, 350, 18);
  const p = progress(frame, 238, 300);
  return (
    <div
      style={{
        position: 'absolute',
        left: 126,
        top: 150,
        width: 740,
        opacity,
        transform: `translateX(${interpolate(p, [0, 1], [-36, 0])}px)`,
        fontFamily: FONT_SANS,
      }}
    >
      <div
        style={{
          color: GOLD,
          fontSize: 18,
          fontWeight: 900,
          letterSpacing: 4,
          textTransform: 'uppercase',
          marginBottom: 24,
        }}
      >
        Drive Your Way.
      </div>
      <div style={{ ...textStyle(88, 950), lineHeight: 0.96, textTransform: 'uppercase' }}>
        Browse premium arrivals with the speed of a modern showroom.
      </div>
    </div>
  );
};

const TeaserFinal = ({ frame }: { frame: number }) => {
  const opacity = interpolate(frame, [328, 360], [0, 1], clamp);
  const settle = progress(frame, 330, 390);
  return (
    <AbsoluteFill
      style={{
        opacity,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FONT_SANS,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 760,
          height: 530,
          border: '1px solid rgba(212,175,55,0.25)',
          borderRadius: 8,
          background: 'rgba(5,5,5,0.64)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 40px 120px rgba(0,0,0,0.46)',
          transform: `translateY(${interpolate(settle, [0, 1], [18, 0])}px)`,
        }}
      >
        <Logo style={{ width: 360, height: 230, marginBottom: 18 }} />
        <div
          style={{
            color: GOLD,
            fontSize: 19,
            fontWeight: 900,
            letterSpacing: 6,
            textTransform: 'uppercase',
            marginBottom: 26,
          }}
        >
          New website
        </div>
        <div style={{ ...textStyle(74, 950), textTransform: 'uppercase' }}>Coming Soon</div>
        <div
          style={{
            marginTop: 34,
            color: 'rgba(255,255,255,0.58)',
            fontSize: 17,
            fontWeight: 800,
            letterSpacing: 3,
            textTransform: 'uppercase',
          }}
        >
          Premium automotive discovery in Sri Lanka
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const SerendibTeaser = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden' }}>
      <TeaserImageLayer
        frame={frame}
        src="/images/showroom/serendib-showroom-floor-03.jpg"
        start={0}
        end={150}
        objectPosition="center center"
      />
      <TeaserImageLayer
        frame={frame}
        src="/images/gallery/vehicle-10.webp"
        start={92}
        end={272}
        objectPosition="center center"
      />
      <TeaserImageLayer
        frame={frame}
        src="/images/showroom/serendib-logo-wall.jpg"
        start={248}
        end={420}
        objectPosition="center center"
      />
      <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(13,11,9,0.94), rgba(13,11,9,0.56), rgba(13,11,9,0.96))' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.86), transparent 42%, rgba(0,0,0,0.94))' }} />
      <FineGrid opacity={0.12} />
      <ScanLines frame={frame} opacity={0.16} />
      <GoldRail frame={frame} />
      <CornerFrame opacity={0.92} />
      <TelemetryStack frame={frame} opacity={fadeInOut(frame, 18, 286, 20)} />
      <TeaserIntroCopy frame={frame} />
      <TeaserMainTitle frame={frame} />
      <TeaserDriveCopy frame={frame} />
      <TeaserFinal frame={frame} />
    </AbsoluteFill>
  );
};

const ShellText = ({
  kicker,
  title,
  align = 'center',
  width = 760,
}: {
  kicker: string;
  title: ReactNode;
  align?: CSSProperties['textAlign'];
  width?: number;
}) => (
  <div style={{ width, maxWidth: '100%', textAlign: align, margin: align === 'center' ? '0 auto' : undefined }}>
    <div
      style={{
        color: GOLD,
        fontFamily: FONT_SANS,
        fontSize: 13,
        fontWeight: 900,
        letterSpacing: 4,
        textTransform: 'uppercase',
        marginBottom: 16,
      }}
    >
      {kicker}
    </div>
    <h2
      style={{
        ...textStyle(58, 950),
        margin: 0,
        lineHeight: 1,
        textTransform: 'uppercase',
      }}
    >
      {title}
    </h2>
  </div>
);

const SectionShell = ({
  height,
  kicker,
  title,
  children,
  style,
}: {
  height: number;
  kicker: string;
  title: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
}) => (
  <section
    style={{
      height,
      width: '100%',
      padding: '78px 86px',
      boxSizing: 'border-box',
      position: 'relative',
      background: BG,
      ...style,
    }}
  >
    <ShellText kicker={kicker} title={title} />
    {children}
  </section>
);

const BrowserTopBar = () => (
  <div
    style={{
      height: 50,
      display: 'grid',
      gridTemplateColumns: '120px 1fr 120px',
      alignItems: 'center',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      background: 'rgba(13,11,9,0.94)',
      padding: '0 20px',
      boxSizing: 'border-box',
    }}
  >
    <div style={{ display: 'flex', gap: 9 }}>
      {['#ff5f57', '#ffbd2e', '#28c840'].map((color) => (
        <span key={color} style={{ width: 13, height: 13, borderRadius: 20, background: color }} />
      ))}
    </div>
    <div
      style={{
        height: 28,
        borderRadius: 999,
        background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.09)',
        color: 'rgba(255,255,255,0.52)',
        fontFamily: FONT_SANS,
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      serendib-trading.vercel.app
    </div>
  </div>
);

const MockHeroSection = () => (
  <section style={{ height: 860, position: 'relative', overflow: 'hidden', background: BG }}>
    <ImageFill
      src="/images/showroom/serendib-showroom-floor-02.jpg"
      objectPosition="center center"
      style={{ filter: 'brightness(0.68) contrast(1.1)' }}
    />
    <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.82), rgba(0,0,0,0.36), rgba(0,0,0,0.78))' }} />
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.82), transparent 42%, rgba(13,11,9,0.98))' }} />
    <div
      style={{
        position: 'absolute',
        top: 34,
        left: 62,
        right: 62,
        height: 66,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: FONT_SANS,
      }}
    >
      <Logo style={{ width: 130, height: 62 }} />
      <div style={{ display: 'flex', gap: 28, color: 'rgba(255,255,255,0.72)', fontSize: 13, fontWeight: 900, letterSpacing: 2 }}>
        <span>Home</span>
        <span>Vehicles</span>
        <span>Gallery</span>
        <span>Contact</span>
      </div>
    </div>
    <div style={{ position: 'absolute', left: 88, top: 220, width: 680, fontFamily: FONT_SANS }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          border: '1px solid rgba(212,175,55,0.32)',
          borderRadius: 999,
          background: 'rgba(212,175,55,0.1)',
          color: GOLD,
          padding: '10px 16px',
          fontSize: 12,
          fontWeight: 900,
          letterSpacing: 2,
          textTransform: 'uppercase',
          marginBottom: 26,
        }}
      >
        <Sparkles size={15} />
        Welcome to Serendib Trading
      </div>
      <div style={{ fontFamily: FONT_SERIF, color: WHITE, fontSize: 106, fontWeight: 900, fontStyle: 'italic', lineHeight: 0.9 }}>
        Drive
      </div>
      <div style={{ ...textStyle(92, 950), color: GOLD_LIGHT, lineHeight: 0.92, textTransform: 'uppercase' }}>Your Way.</div>
      <p style={{ color: 'rgba(255,255,255,0.76)', fontSize: 22, lineHeight: 1.45, marginTop: 32, maxWidth: 560 }}>
        Outstanding performance, curated luxury, and the world's most desired vehicles in one modern showroom.
      </p>
      <div style={{ display: 'flex', gap: 16, marginTop: 42 }}>
        <button
          type="button"
          style={{
            border: 0,
            borderRadius: 999,
            background: GOLD,
            color: '#000',
            padding: '17px 26px',
            fontFamily: FONT_SANS,
            fontSize: 13,
            fontWeight: 950,
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          Explore Collection
        </button>
        <button
          type="button"
          style={{
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.06)',
            color: WHITE,
            padding: '17px 26px',
            fontFamily: FONT_SANS,
            fontSize: 13,
            fontWeight: 900,
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          Contact Us
        </button>
      </div>
    </div>
  </section>
);

const BodyTypeSection = () => (
  <SectionShell height={680} kicker="Categories" title="Browse By Body Type">
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: 18,
        marginTop: 64,
      }}
    >
      {bodyTypes.map((type) => (
        <div
          key={type.name}
          style={{
            height: 250,
            border: `1px solid ${STROKE}`,
            borderRadius: 8,
            background: PANEL,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
            boxSizing: 'border-box',
          }}
        >
          <Img src={pathFor(type.image)} style={{ width: 155, height: 90, objectFit: 'contain', filter: 'invert(1)', opacity: 0.66 }} />
          <span style={{ color: WHITE, fontFamily: FONT_SANS, fontSize: 14, fontWeight: 900, letterSpacing: 3, textTransform: 'uppercase' }}>
            {type.name}
          </span>
        </div>
      ))}
    </div>
  </SectionShell>
);

const MakeSection = () => (
  <SectionShell height={650} kicker="Premier Partners" title="Browse By Make">
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 18,
        marginTop: 58,
      }}
    >
      {brandLogos.map((brand) => (
        <div
          key={brand.name}
          style={{
            height: 150,
            borderRadius: 8,
            border: `1px solid ${STROKE}`,
            background: 'rgba(255,255,255,0.035)',
            display: 'grid',
            gridTemplateColumns: '92px 1fr',
            gap: 22,
            alignItems: 'center',
            padding: '0 28px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              width: 78,
              height: 78,
              borderRadius: 8,
              background: WHITE,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <Img src={pathFor(brand.image)} style={{ width: '86%', height: '86%', objectFit: 'contain' }} />
          </div>
          <span style={{ color: WHITE, fontFamily: FONT_SANS, fontSize: 22, fontWeight: 900, textTransform: 'uppercase' }}>{brand.name}</span>
        </div>
      ))}
    </div>
  </SectionShell>
);

type VehicleCardProps = {
  car: CarInfo;
  large?: boolean;
  key?: string;
};

const VehicleCard = ({ car, large = false }: VehicleCardProps) => (
  <div
    style={{
      borderRadius: 8,
      border: `1px solid ${STROKE}`,
      background: 'rgba(255,255,255,0.045)',
      overflow: 'hidden',
      boxSizing: 'border-box',
      boxShadow: '0 24px 70px rgba(0,0,0,0.26)',
    }}
  >
    <div style={{ position: 'relative', height: large ? 260 : 210, overflow: 'hidden' }}>
      <Img src={pathFor(car.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent, rgba(13,11,9,0.9))' }} />
      <div
        style={{
          position: 'absolute',
          top: 18,
          left: 18,
          borderRadius: 999,
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.13)',
          color: GOLD_LIGHT,
          padding: '8px 12px',
          fontFamily: FONT_SANS,
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}
      >
        Model {car.year}
      </div>
    </div>
    <div style={{ padding: large ? 30 : 24, fontFamily: FONT_SANS }}>
      <div style={{ color: GOLD, fontSize: 12, fontWeight: 900, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 }}>
        {car.make}
      </div>
      <div style={{ color: WHITE, fontSize: large ? 28 : 22, fontWeight: 950, textTransform: 'uppercase', lineHeight: 1.05 }}>
        {car.model}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          alignItems: 'center',
          gap: 16,
          borderTop: '1px solid rgba(255,255,255,0.1)',
          marginTop: 24,
          paddingTop: 20,
        }}
      >
        <div>
          <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' }}>
            Price Guide
          </div>
          <div style={{ color: WHITE, fontSize: 22, fontWeight: 950, fontVariantNumeric: 'tabular-nums', marginTop: 6 }}>
            {millions(car.price)}
          </div>
        </div>
        <ArrowRight color={GOLD} size={30} />
      </div>
    </div>
  </div>
);

const FeaturedSection = () => (
  <SectionShell height={800} kicker="The Latest" title="Featured Arrivals">
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 24,
        marginTop: 58,
      }}
    >
      {cars.slice(0, 3).map((car) => (
        <VehicleCard key={car.model} car={car} large />
      ))}
    </div>
  </SectionShell>
);

const InventorySection = () => (
  <SectionShell height={850} kicker="The Collection" title="Available Inventory">
    <div
      style={{
        margin: '44px auto 52px',
        width: 400,
        height: 56,
        borderRadius: 999,
        border: `1px solid ${STROKE}`,
        background: 'rgba(255,255,255,0.05)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        padding: 5,
        boxSizing: 'border-box',
        fontFamily: FONT_SANS,
      }}
    >
      <div style={{ borderRadius: 999, background: WHITE, color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 950, letterSpacing: 3, textTransform: 'uppercase' }}>
        Registered
      </div>
      <div style={{ color: 'rgba(255,255,255,0.58)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, letterSpacing: 3, textTransform: 'uppercase' }}>
        New
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22 }}>
      {cars.slice(0, 4).map((car) => (
        <VehicleCard key={car.model} car={car} />
      ))}
    </div>
  </SectionShell>
);

const TradeInSection = () => (
  <section
    style={{
      height: 620,
      position: 'relative',
      overflow: 'hidden',
      background: '#0a0908',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      fontFamily: FONT_SANS,
    }}
  >
    <ImageFill src="/images/showroom/serendib-showroom-floor-06.jpg" opacity={0.3} style={{ filter: 'brightness(0.52)' }} />
    <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(13,11,9,0.96), rgba(13,11,9,0.72), rgba(13,11,9,0.96))' }} />
    <div style={{ position: 'relative', width: 860 }}>
      <div style={{ color: GOLD, fontSize: 13, fontWeight: 900, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 18 }}>
        Exchange & Trade-In
      </div>
      <div style={{ ...textStyle(66, 950), textTransform: 'uppercase' }}>Upgrade Your Drive</div>
      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 24, lineHeight: 1.45, margin: '28px auto 42px', maxWidth: 720 }}>
        Competitive, fair evaluation for your current vehicle against a premium Serendib collection.
      </p>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          borderRadius: 999,
          border: '1px solid rgba(212,175,55,0.32)',
          color: GOLD_LIGHT,
          padding: '18px 28px',
          fontSize: 13,
          fontWeight: 950,
          letterSpacing: 3,
          textTransform: 'uppercase',
        }}
      >
        Get Evaluation via WhatsApp
        <ArrowRight size={21} />
      </div>
    </div>
  </section>
);

const ValuesSection = () => (
  <SectionShell height={720} kicker="Our Values" title={<span>Why Choose Serendib</span>}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22, marginTop: 72 }}>
      {values.map(({ title, body, Icon }) => (
        <div
          key={title}
          style={{
            minHeight: 285,
            borderRadius: 8,
            border: `1px solid ${STROKE}`,
            background: 'rgba(255,255,255,0.04)',
            padding: 32,
            boxSizing: 'border-box',
            textAlign: 'center',
            fontFamily: FONT_SANS,
          }}
        >
          <div
            style={{
              width: 82,
              height: 82,
              borderRadius: 999,
              background: 'rgba(212,175,55,0.1)',
              border: '1px solid rgba(212,175,55,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 26px',
            }}
          >
            <Icon color={GOLD_LIGHT} size={35} strokeWidth={1.8} />
          </div>
          <div style={{ color: WHITE, fontSize: 21, fontWeight: 950, lineHeight: 1.1 }}>{title}</div>
          <p style={{ color: MUTED, fontSize: 16, lineHeight: 1.45, marginTop: 18 }}>{body}</p>
        </div>
      ))}
    </div>
  </SectionShell>
);

const FinalWebsiteSection = () => (
  <section
    style={{
      height: 640,
      background: 'linear-gradient(135deg, #0d0b09 0%, #17120a 58%, #050505 100%)',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      alignItems: 'center',
      gap: 60,
      padding: '80px 94px',
      boxSizing: 'border-box',
      fontFamily: FONT_SANS,
    }}
  >
    <div>
      <div style={{ color: GOLD, fontSize: 13, fontWeight: 900, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 18 }}>
        Expert Consultation
      </div>
      <div style={{ ...textStyle(64, 950), textTransform: 'uppercase', lineHeight: 1.02 }}>
        Ready to find your dream car?
      </div>
      <p style={{ color: MUTED, fontSize: 21, lineHeight: 1.45, maxWidth: 610, marginTop: 28 }}>
        Visit the showroom or contact the Serendib team for a personalized consultation.
      </p>
    </div>
    <div
      style={{
        borderRadius: 8,
        border: '1px solid rgba(212,175,55,0.24)',
        background: 'rgba(0,0,0,0.38)',
        padding: 42,
        boxSizing: 'border-box',
      }}
    >
      <Logo style={{ width: 260, height: 130, marginBottom: 24 }} />
      <div style={{ display: 'grid', gap: 24, color: WHITE }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 25, fontWeight: 950 }}>
          <Phone color={GOLD} size={30} />
          075 636 3427
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 23, fontWeight: 850 }}>
          <MapPin color={GOLD} size={30} />
          Dehiwala HQ, Colombo
        </div>
      </div>
    </div>
  </section>
);

const MockWebsitePage = () => (
  <div style={{ width: '100%', background: BG }}>
    <MockHeroSection />
    <BodyTypeSection />
    <MakeSection />
    <FeaturedSection />
    <InventorySection />
    <TradeInSection />
    <ValuesSection />
    <FinalWebsiteSection />
  </div>
);

const showcaseScenes = [
  {
    start: 0,
    end: 180,
    kicker: 'Hero',
    title: 'Drive Your Way.',
    body: 'A cinematic first impression with the brand promise and fast collection access.',
  },
  {
    start: 180,
    end: 355,
    kicker: 'Discovery',
    title: 'Browse by body type',
    body: 'SUV, sedan, hatchback, luxury, MPV, and crossover paths help buyers start fast.',
  },
  {
    start: 355,
    end: 525,
    kicker: 'Brand routes',
    title: 'Browse by make',
    body: 'Make-level browsing supports Toyota, Honda, Mercedes, BMW, Land Rover, and more.',
  },
  {
    start: 525,
    end: 730,
    kicker: 'Featured arrivals',
    title: 'Premium inventory cards',
    body: 'Vehicle imagery, model year, make, model, and LKR price guide are designed for quick scanning.',
  },
  {
    start: 730,
    end: 930,
    kicker: 'Available inventory',
    title: 'Clear collection view',
    body: 'Registered and new stock views keep live inventory visible and easy to compare.',
  },
  {
    start: 930,
    end: 1090,
    kicker: 'Exchange & Trade-In',
    title: 'Upgrade Your Drive',
    body: 'The website makes trade-in evaluation a first-class conversion path.',
  },
  {
    start: 1090,
    end: 1265,
    kicker: 'Trust pillars',
    title: 'Why Choose Serendib',
    body: 'Imports, verified mileage, premium finance, and RMV support anchor the trust story.',
  },
  {
    start: 1265,
    end: 1440,
    kicker: 'Contact',
    title: 'Ready to find your dream car?',
    body: 'The final call to action brings viewers to showroom and phone contact details.',
  },
];

const ShowcaseCallout = ({ frame }: { frame: number }) => {
  const scene = showcaseScenes.find((item) => frame >= item.start && frame < item.end) ?? showcaseScenes[showcaseScenes.length - 1];
  const opacity = fadeInOut(frame, scene.start, scene.end, 22);
  const y = interpolate(progress(frame, scene.start, Math.min(scene.start + 48, scene.end)), [0, 1], [24, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        left: 70,
        top: 146,
        width: 320,
        opacity,
        transform: `translateY(${y}px)`,
        fontFamily: FONT_SANS,
        padding: 24,
        borderRadius: 8,
        border: '1px solid rgba(212,175,55,0.28)',
        background: 'rgba(0,0,0,0.54)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.34)',
      }}
    >
      <div style={{ color: GOLD, fontSize: 12, fontWeight: 950, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 14 }}>
        {scene.kicker}
      </div>
      <div style={{ color: WHITE, fontSize: 30, fontWeight: 950, lineHeight: 1.06, textTransform: 'uppercase' }}>{scene.title}</div>
      <p style={{ color: 'rgba(255,255,255,0.68)', fontSize: 16, lineHeight: 1.42, margin: '16px 0 0' }}>{scene.body}</p>
    </div>
  );
};

const WebsiteScrollFrame = ({ frame }: { frame: number }) => {
  const scrollY = interpolate(
    frame,
    [0, 150, 300, 475, 650, 850, 1010, 1180, 1340, 1440],
    [0, 0, 730, 1380, 2050, 2870, 3700, 4240, 4860, 4860],
    {
      easing: easeInOut,
      ...clamp,
    },
  );
  const frameOpacity = fadeInOut(frame, 0, 1390, 26);
  const zoom = interpolate(frame, [0, 140, 1380, 1440], [0.965, 1, 1, 0.97], clamp);

  return (
    <div
      style={{
        position: 'absolute',
        left: 430,
        top: 98,
        width: 1390,
        height: 874,
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.16)',
        boxShadow: '0 46px 150px rgba(0,0,0,0.58)',
        opacity: frameOpacity,
        transform: `scale(${zoom})`,
        transformOrigin: 'center center',
        background: BG,
      }}
    >
      <BrowserTopBar />
      <div style={{ position: 'relative', width: '100%', height: 824, overflow: 'hidden' }}>
        <div
          style={{
            width: '100%',
            transform: `translateY(${-scrollY}px)`,
            willChange: 'transform',
          }}
        >
          <MockWebsitePage />
        </div>
      </div>
    </div>
  );
};

const ShowcaseFinalOverlay = ({ frame }: { frame: number }) => {
  const opacity = interpolate(frame, [1320, 1364], [0, 1], clamp);
  return (
    <AbsoluteFill
      style={{
        opacity,
        background: 'rgba(13,11,9,0.86)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FONT_SANS,
      }}
    >
      <div
        style={{
          width: 820,
          borderRadius: 8,
          border: '1px solid rgba(212,175,55,0.28)',
          background: 'rgba(0,0,0,0.54)',
          padding: '58px 66px',
          boxSizing: 'border-box',
          textAlign: 'center',
          boxShadow: '0 34px 120px rgba(0,0,0,0.46)',
        }}
      >
        <Logo style={{ width: 330, height: 220, margin: '0 auto 18px' }} />
        <div style={{ color: GOLD, fontSize: 14, fontWeight: 950, letterSpacing: 5, textTransform: 'uppercase', marginBottom: 22 }}>
          Website showcase
        </div>
        <div style={{ ...textStyle(54, 950), textTransform: 'uppercase', lineHeight: 1.08 }}>
          Serendib Trading
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, color: 'rgba(255,255,255,0.72)', fontSize: 19, fontWeight: 850, marginTop: 28 }}>
          <span>075 636 3427</span>
          <span style={{ color: GOLD }}>|</span>
          <span>Dehiwala HQ, Colombo</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ShowcaseProgress = ({ frame }: { frame: number }) => {
  const width = interpolate(frame, [0, 1440], [0, 1], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: 104,
        right: 104,
        bottom: 58,
        height: 3,
        background: 'rgba(255,255,255,0.12)',
        overflow: 'hidden',
      }}
    >
      <div style={{ width: `${width * 100}%`, height: '100%', background: GOLD }} />
    </div>
  );
};

export const SerendibWebsiteShowcase = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const bgShift = interpolate(frame, [0, durationInFrames], [-36, 36], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden' }}>
      <ImageFill
        src="/images/showroom/serendib-showroom-floor-01.jpg"
        opacity={0.26}
        objectPosition="center center"
        style={{
          filter: 'brightness(0.42) contrast(1.12)',
          transform: `scale(1.08) translateX(${bgShift}px)`,
        }}
      />
      <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.94), rgba(13,11,9,0.5), rgba(0,0,0,0.9))' }} />
      <FineGrid opacity={0.07} />
      <WebsiteScrollFrame frame={frame} />
      <ShowcaseCallout frame={frame} />
      <ShowcaseProgress frame={frame} />
      <ShowcaseFinalOverlay frame={frame} />
    </AbsoluteFill>
  );
};
