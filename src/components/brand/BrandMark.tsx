import React from 'react';
import Toyota from '@thesvg/react/toyota';
import Honda from '@thesvg/react/honda';
import Suzuki from '@thesvg/react/suzuki';
import Nissan from '@thesvg/react/nissan';
import Mitsubishi from '@thesvg/react/mitsubishi';
import MercedesBenz from '@thesvg/react/mercedes-benz';
import Bmw from '@thesvg/react/bmw';
import Kia from '@thesvg/react/kia';
import Mazda from '@thesvg/react/mazda';
import Hyundai from '@thesvg/react/hyundai';
import { clsx } from 'clsx';

type BrandIconComponent = React.ElementType<React.SVGProps<SVGSVGElement>>;

interface BrandMarkProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  make?: string | null;
  iconClassName?: string;
  tone?: 'mono' | 'color';
  decorative?: boolean;
}

const LandRover = (props: React.SVGProps<SVGSVGElement>) => (
  <svg role="img" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
    <title>Land Rover</title>
    <path d="M12 5.143c-6.627 0-12 3.07-12 6.857s5.373 6.857 12 6.857 12-3.07 12-6.857-5.373-6.857-12-6.857zm0 12c-5.46 0-9.888-2.302-9.888-5.143s4.428-5.143 9.888-5.143 9.888 2.302 9.888 5.143-4.428 5.143-9.888 5.143zm-7.616-4.321h1.037v2.185h.919V12.01h1.531v-.706H4.384v.706zm4.12 0h.918v2.185h-.918V12.822zm2.648 0h1.037v2.185h.919V12.01h1.531v-.706h-3.487v.718z" />
  </svg>
);

export const normalizeMakeKey = (make?: string | null) =>
  (make || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const makeAliases: Record<string, string> = {
  benz: 'mercedes-benz',
  mercedes: 'mercedes-benz',
  'mercedes-benz': 'mercedes-benz',
};

const getBrandKey = (make?: string | null) => {
  const key = normalizeMakeKey(make);
  return makeAliases[key] || key;
};

const brandIcons: Record<string, BrandIconComponent> = {
  toyota: Toyota,
  honda: Honda,
  kia: Kia,
  suzuki: Suzuki,
  nissan: Nissan,
  mitsubishi: Mitsubishi,
  'mitsubishi-motors': Mitsubishi,
  'mercedes-benz': MercedesBenz,
  bmw: Bmw,
  mazda: Mazda,
  hyundai: Hyundai,
  'land-rover': LandRover,
};

const brandLabels: Record<string, string> = {
  toyota: 'Toyota',
  honda: 'Honda',
  kia: 'Kia',
  suzuki: 'Suzuki',
  nissan: 'Nissan',
  mitsubishi: 'Mitsubishi',
  'mitsubishi-motors': 'Mitsubishi',
  'mercedes-benz': 'Mercedes-Benz',
  bmw: 'BMW',
  mazda: 'Mazda',
  hyundai: 'Hyundai',
  'land-rover': 'Land Rover',
};

export const hasBrandMark = (make?: string | null) => Boolean(brandIcons[getBrandKey(make)]);

export const getBrandLabel = (make?: string | null) => {
  const key = getBrandKey(make);
  return brandLabels[key] || make || 'Vehicle make';
};

export const getDisplayModel = (make?: string | null, model?: string | null) => {
  const rawModel = (model || '').trim();
  if (!rawModel) return '';

  const brandLabel = getBrandLabel(make);
  const prefixes = [make || '', brandLabel];

  if (getBrandKey(make) === 'mercedes-benz') {
    prefixes.push('Mercedes Benz', 'Mercedes-Benz', 'Mercedes', 'Benz');
  }

  const prefixPattern = prefixes
    .map((prefix) => prefix.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .map((prefix) =>
      prefix
        .split(/[\s-]+/)
        .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('[-\\s]+')
    )
    .join('|');

  if (!prefixPattern) return rawModel;

  const cleaned = rawModel.replace(new RegExp(`^(${prefixPattern})\\s+`, 'i'), '').trim();
  return cleaned || rawModel;
};

const getInitials = (label: string) =>
  label
    .split(/\s|-/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase() || 'ST';

export function BrandMark({
  make,
  className,
  iconClassName,
  tone = 'mono',
  decorative = true,
  ...props
}: BrandMarkProps) {
  const key = getBrandKey(make);
  const Icon = brandIcons[key];
  const label = getBrandLabel(make);

  if (!Icon) {
    return (
      <span
        className={clsx('inline-flex items-center justify-center text-[10px] font-black uppercase tracking-normal', className)}
        aria-hidden={decorative || undefined}
        aria-label={decorative ? undefined : label}
        title={label}
        {...props}
      >
        {getInitials(label)}
      </span>
    );
  }

  const iconProps: React.SVGProps<SVGSVGElement> =
    tone === 'mono'
      ? { fill: 'currentColor' }
      : {};

  return (
    <span
      className={clsx('inline-flex items-center justify-center', className)}
      aria-hidden={decorative || undefined}
      title={label}
      {...props}
    >
      <Icon
        {...iconProps}
        focusable="false"
        role={decorative ? undefined : 'img'}
        aria-label={decorative ? undefined : label}
        className={clsx('block h-full w-full object-contain', iconClassName)}
      />
    </span>
  );
}
