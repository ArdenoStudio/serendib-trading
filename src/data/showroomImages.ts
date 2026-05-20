export type ShowroomImage = {
  src: string;
  alt: string;
  caption: string;
  objectPosition?: string;
};

export const SHOWROOM_IMAGES: ShowroomImage[] = [
  {
    src: '/images/showroom/serendib-showroom-floor-01.jpg',
    alt: 'Serendib Trading showroom with vehicles displayed between blue pillars',
    caption: 'Showroom arrival lane',
    objectPosition: 'center center',
  },
  {
    src: '/images/showroom/serendib-showroom-floor-02.jpg',
    alt: 'Serendib Trading showroom floor with premium vehicles under ceiling lights',
    caption: 'Curated showroom floor',
    objectPosition: 'center center',
  },
  {
    src: '/images/showroom/serendib-showroom-floor-03.jpg',
    alt: 'Mini Cooper displayed inside the Serendib Trading showroom',
    caption: 'Feature display bay',
    objectPosition: 'center center',
  },
  {
    src: '/images/showroom/serendib-showroom-floor-04.jpg',
    alt: 'Serendib Trading showroom with a Mini Cooper and van on display',
    caption: 'Indoor viewing area',
    objectPosition: 'center center',
  },
  {
    src: '/images/showroom/serendib-showroom-floor-05.jpg',
    alt: 'Black vehicle displayed inside Serendib Trading showroom',
    caption: 'Private inspection space',
    objectPosition: 'center center',
  },
  {
    src: '/images/showroom/serendib-logo-wall.jpg',
    alt: 'Illuminated Serendib Trading logo wall inside the showroom',
    caption: 'Serendib identity wall',
    objectPosition: 'center center',
  },
  {
    src: '/images/showroom/serendib-showroom-art-wall.jpg',
    alt: 'Serendib Trading showroom art wall and vehicle display area',
    caption: 'Showroom detail wall',
    objectPosition: 'center center',
  },
  {
    src: '/images/showroom/serendib-showroom-floor-06.jpg',
    alt: 'Serendib Trading showroom with SUV and van displays',
    caption: 'Collection display',
    objectPosition: 'center center',
  },
];

export const HERO_SHOWROOM_SLIDES = [
  SHOWROOM_IMAGES[2],
  SHOWROOM_IMAGES[3],
  SHOWROOM_IMAGES[1],
  SHOWROOM_IMAGES[5],
  SHOWROOM_IMAGES[7],
];
