import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Camera, Car, Building2 } from 'lucide-react';
import Footer from '../components/Footer';
import ImageLightbox from '../components/ImageLightbox';
import SEO from '../components/SEO';
import { SHOWROOM_IMAGES } from '../data/showroomImages';

const PAGE_SIZE = 12;

type GalleryCategory = 'vehicles' | 'showroom';
type GalleryImage = {
  src: string;
  category: GalleryCategory;
  alt: string;
};

const SHOWROOM_GALLERY_IMAGES: GalleryImage[] = SHOWROOM_IMAGES.map((image) => ({
  src: image.src,
  category: 'showroom',
  alt: image.alt,
}));

// Labels follow the original gallery asset sets (not brand-guessed from file order alone).
const GALLERY_IMAGES: GalleryImage[] = [
  ...SHOWROOM_GALLERY_IMAGES,
  // Toyota Land Cruiser Prado set
  { src: '/images/gallery/vehicle-1.webp', category: 'vehicles', alt: 'Toyota Land Cruiser Prado exterior on the Serendib floor' },
  { src: '/images/gallery/vehicle-2.webp', category: 'vehicles', alt: 'Toyota Land Cruiser Prado three-quarter view' },
  { src: '/images/gallery/vehicle-3.webp', category: 'vehicles', alt: 'Toyota Land Cruiser Prado cabin detail' },
  // BMW 5 Series set
  { src: '/images/gallery/vehicle-4.webp', category: 'vehicles', alt: 'BMW 5 Series M Sport front exterior' },
  { src: '/images/gallery/vehicle-5.webp', category: 'vehicles', alt: 'BMW 5 Series side profile' },
  { src: '/images/gallery/vehicle-6.webp', category: 'vehicles', alt: 'BMW 5 Series interior and trim' },
  // Honda Vezel / crossover set
  { src: '/images/gallery/vehicle-7.webp', category: 'vehicles', alt: 'Honda Vezel Hybrid crossover exterior' },
  { src: '/images/gallery/vehicle-8.webp', category: 'vehicles', alt: 'Honda Vezel Hybrid cabin and dash' },
  { src: '/images/gallery/vehicle-9.webp', category: 'vehicles', alt: 'Honda Vezel Hybrid rear and boot detail' },
  // Land Rover Range Rover set
  { src: '/images/gallery/vehicle-10.webp', category: 'vehicles', alt: 'Range Rover Vogue luxury SUV exterior' },
  { src: '/images/gallery/vehicle-11.webp', category: 'vehicles', alt: 'Range Rover Vogue side and wheels' },
  { src: '/images/gallery/vehicle-12.webp', category: 'vehicles', alt: 'Range Rover Vogue interior seating' },
  // Toyota Aqua hybrid set
  { src: '/images/gallery/vehicle-13.webp', category: 'vehicles', alt: 'Toyota Aqua Hybrid compact hatch exterior' },
  { src: '/images/gallery/vehicle-14.webp', category: 'vehicles', alt: 'Toyota Aqua Hybrid interior overview' },
  { src: '/images/gallery/vehicle-15.webp', category: 'vehicles', alt: 'Toyota Aqua Hybrid detail shot' },
  // Mercedes-Benz C-Class set
  { src: '/images/gallery/vehicle-16.webp', category: 'vehicles', alt: 'Mercedes-Benz C-Class AMG Line exterior' },
  { src: '/images/gallery/vehicle-17.webp', category: 'vehicles', alt: 'Mercedes-Benz C-Class front grille and lamps' },
  { src: '/images/gallery/vehicle-18.webp', category: 'vehicles', alt: 'Mercedes-Benz C-Class cabin detail' },
  // Additional inventory photography
  { src: '/images/gallery/vehicle-19.webp', category: 'vehicles', alt: 'Imported sedan displayed at Serendib Trading' },
  { src: '/images/gallery/vehicle-20.webp', category: 'vehicles', alt: 'Vehicle interior stitching and materials close-up' },
  { src: '/images/gallery/vehicle-21.webp', category: 'vehicles', alt: 'Dashboard and instrument cluster detail' },
  { src: '/images/gallery/vehicle-22.webp', category: 'vehicles', alt: 'Vehicle exterior paint and body line detail' },
  { src: '/images/gallery/vehicle-23.webp', category: 'vehicles', alt: 'Premium alloy wheel and brake detail' },
  { src: '/images/gallery/vehicle-24.webp', category: 'vehicles', alt: 'Rear exterior of an imported passenger car' },
  { src: '/images/gallery/vehicle-25.webp', category: 'vehicles', alt: 'Showroom lighting on a listed vehicle' },
  { src: '/images/gallery/vehicle-26.webp', category: 'vehicles', alt: 'SUV exterior parked for inspection' },
  { src: '/images/gallery/vehicle-27.webp', category: 'vehicles', alt: 'SUV cabin seats and door cards' },
  { src: '/images/gallery/vehicle-28.webp', category: 'vehicles', alt: 'SUV centre console and controls' },
  // Floor / presentation shots mixed into gallery assets
  { src: '/images/gallery/vehicle-29.webp', category: 'showroom', alt: 'Dehiwala showroom presentation bay' },
  { src: '/images/gallery/vehicle-30.webp', category: 'showroom', alt: 'Vehicles arranged for customer viewing' },
  { src: '/images/gallery/vehicle-31.webp', category: 'showroom', alt: 'Indoor showroom aisle and lighting' },
  { src: '/images/gallery/vehicle-32.webp', category: 'showroom', alt: 'Premium display corner in the Serendib showroom' },
  { src: '/images/gallery/vehicle-33.webp', category: 'showroom', alt: 'Floor presentation with multiple units' },
  { src: '/images/gallery/vehicle-34.webp', category: 'vehicles', alt: 'SUV exterior three-quarter view' },
  { src: '/images/gallery/vehicle-35.webp', category: 'vehicles', alt: 'SUV premium exterior finish' },
  { src: '/images/gallery/vehicle-36.webp', category: 'showroom', alt: 'Showroom ambiance and ambient lighting' },
  { src: '/images/gallery/vehicle-37.webp', category: 'showroom', alt: 'Vehicle arrangement for walk-around inspection' },
  { src: '/images/gallery/vehicle-38.webp', category: 'showroom', alt: 'Serendib Trading collection display' },
];

export default function Gallery() {
  const [filter, setFilter] = useState<'all' | 'vehicles' | 'showroom'>('all');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredImages = useMemo(
    () =>
      filter === 'all'
        ? GALLERY_IMAGES
        : GALLERY_IMAGES.filter((img) => img.category === filter),
    [filter],
  );

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filter]);

  const visibleImages = filteredImages.slice(0, visibleCount);
  const hasMore = visibleCount < filteredImages.length;

  return (
    <div className="min-h-screen bg-[#0d0b09] text-white overflow-x-hidden">
      <SEO
        title="Vehicle and Showroom Gallery"
        description="Explore Serendib Trading showroom photos, imported vehicle details, and premium car display moments from Dehiwala, Sri Lanka."
        canonical="/gallery"
        pageType="ImageGallery"
        ogImage={SHOWROOM_IMAGES[0].src}
        ogImageAlt="Serendib Trading showroom and vehicle gallery"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Gallery', path: '/gallery' },
        ]}
        keywords={[
          'Serendib Trading gallery',
          'Sri Lanka vehicle showroom photos',
          'imported car gallery Sri Lanka',
          'Dehiwala car showroom',
        ]}
      />

      <main className="pt-32 pb-20">
        {/* Header */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 mb-12">
          <div className="text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10"
            >
              <Camera className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[#D4AF37] font-black tracking-[0.3em] uppercase text-[10px]">Visual Collection</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-black tracking-[-0.05em] uppercase"
            >
              The <span className="text-[#D4AF37]">Gallery</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-xl mx-auto text-white/60"
            >
              A curated look at our vehicles, showroom moments, and the Serendib experience.
            </motion.p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div data-testid="gallery" className="max-w-[1400px] mx-auto px-6 lg:px-10 mb-12">
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { id: 'all', label: 'All', icon: Camera },
              { id: 'vehicles', label: 'Vehicles', icon: Car },
              { id: 'showroom', label: 'Showroom', icon: Building2 },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id as typeof filter)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${
                  filter === id
                    ? 'bg-[#D4AF37] text-black'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid — paginated so first paint doesn't load every image */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          {filteredImages.length > 0 ? (
            <>
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {visibleImages.map((image, i) => (
                <motion.button
                  type="button"
                  key={image.src}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(i, 8) * 0.04 }}
                  onClick={() => setLightboxImage(image.src)}
                  aria-label={`Open ${image.alt}`}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left cursor-pointer"
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading={i < 4 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-4 left-4 right-4 opacity-100 translate-y-0 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:translate-y-0 transition-all duration-300">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
                      {image.category}
                    </span>
                    <p className="text-sm font-medium mt-1">{image.alt}</p>
                  </div>
                </motion.button>
              ))}
            </motion.div>
            {hasMore && (
              <div className="mt-12 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                  className="rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-8 py-4 text-[11px] font-black uppercase tracking-[0.25em] text-[#D4AF37] transition-colors hover:bg-[#D4AF37] hover:text-black"
                >
                  Load more ({filteredImages.length - visibleCount} left)
                </button>
              </div>
            )}
            </>
          ) : (
            <div className="text-center py-20 px-6">
              <div className="max-w-md mx-auto space-y-6">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                  <Camera className="w-10 h-10 text-[#D4AF37]/50" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight">No Photos Found</h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  There are no images in this category yet. View the full gallery to see the showroom and vehicle collection.
                </p>
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className="rounded-full bg-[#D4AF37] px-6 py-3 text-[11px] font-black uppercase tracking-widest text-black transition-transform active:scale-[0.98]"
                >
                  View All Photos
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Lightbox */}
      <ImageLightbox
        src={lightboxImage || ''}
        alt="Gallery image"
        isOpen={!!lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
}
