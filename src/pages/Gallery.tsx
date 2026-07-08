import { motion } from 'framer-motion';
import { useState } from 'react';
import { Camera, Car, Building2 } from 'lucide-react';
import Footer from '../components/Footer';
import ImageLightbox from '../components/ImageLightbox';
import SEO from '../components/SEO';
import { SHOWROOM_IMAGES } from '../data/showroomImages';

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

const GALLERY_IMAGES: GalleryImage[] = [
  ...SHOWROOM_GALLERY_IMAGES,
  // Mercedes-Benz (6 images)
  { src: '/images/gallery/vehicle-1.webp', category: 'vehicles', alt: 'Mercedes-Benz showcase' },
  { src: '/images/gallery/vehicle-2.webp', category: 'vehicles', alt: 'Mercedes-Benz exterior' },
  { src: '/images/gallery/vehicle-3.webp', category: 'vehicles', alt: 'Mercedes-Benz interior' },
  { src: '/images/gallery/vehicle-4.webp', category: 'vehicles', alt: 'Mercedes-Benz detail' },
  { src: '/images/gallery/vehicle-5.webp', category: 'vehicles', alt: 'Mercedes-Benz luxury' },
  { src: '/images/gallery/vehicle-6.webp', category: 'vehicles', alt: 'Mercedes-Benz premium' },
  
  // Toyota Camry (7 images)
  { src: '/images/gallery/vehicle-7.webp', category: 'vehicles', alt: 'Toyota Camry showcase' },
  { src: '/images/gallery/vehicle-8.webp', category: 'vehicles', alt: 'Toyota Camry interior' },
  { src: '/images/gallery/vehicle-9.webp', category: 'vehicles', alt: 'Toyota Camry detail' },
  { src: '/images/gallery/vehicle-10.webp', category: 'vehicles', alt: 'Toyota Camry exterior' },
  { src: '/images/gallery/vehicle-11.webp', category: 'vehicles', alt: 'Toyota Camry luxury' },
  { src: '/images/gallery/vehicle-12.webp', category: 'vehicles', alt: 'Toyota Camry premium' },
  { src: '/images/gallery/vehicle-13.webp', category: 'vehicles', alt: 'Toyota Camry elegance' },
  
  // Mini Cooper (5 images)
  { src: '/images/gallery/vehicle-14.webp', category: 'vehicles', alt: 'Mini Cooper showcase' },
  { src: '/images/gallery/vehicle-15.webp', category: 'vehicles', alt: 'Mini Cooper interior' },
  { src: '/images/gallery/vehicle-16.webp', category: 'vehicles', alt: 'Mini Cooper detail' },
  { src: '/images/gallery/vehicle-17.webp', category: 'vehicles', alt: 'Mini Cooper exterior' },
  { src: '/images/gallery/vehicle-18.webp', category: 'vehicles', alt: 'Mini Cooper classic' },
  
  // Toyota Premio (7 images)
  { src: '/images/gallery/vehicle-19.webp', category: 'vehicles', alt: 'Toyota Premio showcase' },
  { src: '/images/gallery/vehicle-20.webp', category: 'vehicles', alt: 'Toyota Premio interior' },
  { src: '/images/gallery/vehicle-21.webp', category: 'vehicles', alt: 'Toyota Premio detail' },
  { src: '/images/gallery/vehicle-22.webp', category: 'vehicles', alt: 'Toyota Premio exterior' },
  { src: '/images/gallery/vehicle-23.webp', category: 'vehicles', alt: 'Toyota Premio luxury' },
  { src: '/images/gallery/vehicle-24.webp', category: 'vehicles', alt: 'Toyota Premio premium' },
  { src: '/images/gallery/vehicle-25.webp', category: 'vehicles', alt: 'Toyota Premio elegance' },
  
  // Kia Sorento (10 images) - treating as showroom/vehicles mix for variety
  { src: '/images/gallery/vehicle-26.webp', category: 'vehicles', alt: 'Kia Sorento showcase' },
  { src: '/images/gallery/vehicle-27.webp', category: 'vehicles', alt: 'Kia Sorento interior' },
  { src: '/images/gallery/vehicle-28.webp', category: 'vehicles', alt: 'Kia Sorento detail' },
  { src: '/images/gallery/vehicle-29.webp', category: 'showroom', alt: 'Showroom presentation' },
  { src: '/images/gallery/vehicle-30.webp', category: 'showroom', alt: 'Vehicle display' },
  { src: '/images/gallery/vehicle-31.webp', category: 'showroom', alt: 'Showroom interior' },
  { src: '/images/gallery/vehicle-32.webp', category: 'showroom', alt: 'Luxury showcase' },
  { src: '/images/gallery/vehicle-33.webp', category: 'showroom', alt: 'Premium display' },
  { src: '/images/gallery/vehicle-34.webp', category: 'vehicles', alt: 'Kia Sorento exterior' },
  { src: '/images/gallery/vehicle-35.webp', category: 'vehicles', alt: 'Kia Sorento premium' },
  // Additional Sorento shots categorized as showroom
  { src: '/images/gallery/vehicle-36.webp', category: 'showroom', alt: 'Showroom ambiance' },
  { src: '/images/gallery/vehicle-37.webp', category: 'showroom', alt: 'Vehicle arrangement' },
  { src: '/images/gallery/vehicle-38.webp', category: 'showroom', alt: 'Collection display' },
];

export default function Gallery() {
  const [filter, setFilter] = useState<'all' | 'vehicles' | 'showroom'>('all');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const filteredImages = filter === 'all' 
    ? GALLERY_IMAGES 
    : GALLERY_IMAGES.filter(img => img.category === filter);

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
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 mb-12">
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { id: 'all', label: 'All', icon: Camera },
              { id: 'vehicles', label: 'Vehicles', icon: Car },
              { id: 'showroom', label: 'Showroom', icon: Building2 },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
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

        {/* Gallery Grid */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          {filteredImages.length > 0 ? (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {filteredImages.map((image, i) => (
                <motion.button
                  type="button"
                  key={image.src}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setLightboxImage(image.src)}
                  aria-label={`Open ${image.alt}`}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/5 bg-cover bg-center text-left cursor-pointer"
                  style={{ backgroundImage: `url(${image.src})` }}
                >
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${image.src})` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
                      {image.category}
                    </span>
                    <p className="text-sm font-medium mt-1">{image.alt}</p>
                  </div>
                </motion.button>
              ))}
            </motion.div>
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
