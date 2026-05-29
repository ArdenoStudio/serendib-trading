import { Car } from '../data/types';
import { INSTAGRAM_URL } from './socialLinks';

export type JsonLd = Record<string, unknown>;

export interface SeoBreadcrumb {
  name: string;
  path: string;
}

export interface SeoFaq {
  question: string;
  answer: string;
}

export const SITE_NAME = 'Serendib Trading';
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://serendibtrading.lk').replace(/\/$/, '');
export const SITE_DESCRIPTION =
  'Serendib Trading lists inspected UK and Japan vehicle imports in Sri Lanka with clear histories, finance guidance, and showroom viewing.';
export const DEFAULT_OG_IMAGE = '/images/showroom/serendib-showroom-floor-02.jpg';

export const BUSINESS = {
  name: SITE_NAME,
  phone: '+94756363427',
  alternatePhone: '+94777797421',
  email: 'bilalikras1@gmail.com',
  streetAddress: '47/A S. De S. Jayasinghe Mawatha',
  locality: 'Dehiwala-Mount Lavinia',
  region: 'Western Province',
  country: 'LK',
  latitude: 6.849007995050114,
  longitude: 79.86608731477255,
  priceRange: 'LKR',
};

export const CORE_KEYWORDS = [
  'imported vehicles Sri Lanka',
  'cars for sale Sri Lanka',
  'vehicle dealer Dehiwala',
  'UK imports Sri Lanka',
  'Japan imports Sri Lanka',
  'registered cars Sri Lanka',
  'reconditioned cars Sri Lanka',
];

export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath === '/' ? '/' : normalizedPath}`;
}

function cleanJsonLd(value: unknown): unknown {
  if (Array.isArray(value)) {
    const cleaned = value
      .map((item) => cleanJsonLd(item))
      .filter((item) => item !== undefined && item !== null);
    return cleaned.length > 0 ? cleaned : undefined;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => [key, cleanJsonLd(item)] as const)
      .filter(([, item]) => item !== undefined && item !== null && item !== '');

    return entries.length > 0 ? Object.fromEntries(entries) : undefined;
  }

  return value;
}

export function stringifyJsonLd(data: JsonLd): string {
  return JSON.stringify(cleanJsonLd(data)).replace(/</g, '\\u003c');
}

export function createOrganizationSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    '@id': absoluteUrl('/#organization'),
    name: BUSINESS.name,
    url: absoluteUrl('/'),
    logo: absoluteUrl('/serendib-logo.png'),
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    description: SITE_DESCRIPTION,
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    priceRange: BUSINESS.priceRange,
    sameAs: [INSTAGRAM_URL],
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS.streetAddress,
      addressLocality: BUSINESS.locality,
      addressRegion: BUSINESS.region,
      addressCountry: BUSINESS.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: BUSINESS.latitude,
      longitude: BUSINESS.longitude,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Sri Lanka',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: BUSINESS.phone,
        contactType: 'sales',
        areaServed: BUSINESS.country,
        availableLanguage: 'English',
      },
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '09:00',
        closes: '14:00',
      },
    ],
    knowsAbout: [
      'Imported vehicles',
      'UK vehicle imports',
      'Japan vehicle imports',
      'Vehicle finance in Sri Lanka',
      'Registered and reconditioned cars',
    ],
  };
}

export function createWebsiteSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': absoluteUrl('/#website'),
    name: SITE_NAME,
    url: absoluteUrl('/'),
    publisher: {
      '@id': absoluteUrl('/#organization'),
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${absoluteUrl('/inventory')}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function createBreadcrumbSchema(breadcrumbs: SeoBreadcrumb[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.name,
      item: absoluteUrl(breadcrumb.path),
    })),
  };
}

export function createWebPageSchema(input: {
  pageType?: string;
  canonicalUrl: string;
  title: string;
  description: string;
  image: string;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': input.pageType || 'WebPage',
    '@id': `${input.canonicalUrl}#webpage`,
    url: input.canonicalUrl,
    name: input.title,
    description: input.description,
    inLanguage: 'en-LK',
    isPartOf: {
      '@id': absoluteUrl('/#website'),
    },
    about: {
      '@id': absoluteUrl('/#organization'),
    },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: input.image,
    },
  };
}

export function createVehicleSchema(car: Car): JsonLd {
  const vehicleName = `${car.year} ${car.make} ${car.model}`;
  const url = absoluteUrl(`/car/${car.id}`);
  const images = [car.image, ...(car.gallery || [])].map(absoluteUrl);
  const keyFeatures = car.key_features || car.keyFeatures || [];

  return {
    '@context': 'https://schema.org',
    '@type': ['Product', 'Vehicle'],
    '@id': `${url}#vehicle`,
    name: vehicleName,
    description: car.description || `${vehicleName} listed by Serendib Trading in Sri Lanka.`,
    image: images,
    url,
    brand: {
      '@type': 'Brand',
      name: car.make,
    },
    model: car.model,
    category: car.bodyType,
    color: car.color,
    vehicleModelDate: String(car.year),
    vehicleTransmission: car.transmission,
    fuelType: car.fuel,
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: car.mileage,
      unitCode: 'KMT',
    },
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Condition', value: car.condition },
      { '@type': 'PropertyValue', name: 'Body type', value: car.bodyType },
      ...keyFeatures.map((feature) => ({ '@type': 'PropertyValue', name: 'Feature', value: feature })),
    ],
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'LKR',
      price: car.price,
      availability: car.is_sold ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      itemCondition: car.condition.toLowerCase() === 'new'
        ? 'https://schema.org/NewCondition'
        : 'https://schema.org/UsedCondition',
      seller: {
        '@id': absoluteUrl('/#organization'),
      },
    },
  };
}

export function createInventoryItemListSchema(cars: Car[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${absoluteUrl('/inventory')}#vehicle-list`,
    name: 'Serendib Trading available vehicle inventory',
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    numberOfItems: cars.length,
    itemListElement: cars.slice(0, 12).map((car, index) => {
      const vehicleName = `${car.year} ${car.make} ${car.model}`;
      const url = absoluteUrl(`/car/${car.id}`);

      return {
        '@type': 'ListItem',
        position: index + 1,
        url,
        item: {
          '@type': ['Product', 'Vehicle'],
          '@id': `${url}#vehicle`,
          name: vehicleName,
          image: absoluteUrl(car.image),
          brand: {
            '@type': 'Brand',
            name: car.make,
          },
          offers: {
            '@type': 'Offer',
            priceCurrency: 'LKR',
            price: car.price,
            availability: car.is_sold ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
            url,
          },
        },
      };
    }),
  };
}

export function createFAQSchema(faqs: SeoFaq[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
