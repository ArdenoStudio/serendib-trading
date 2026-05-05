import { motion } from 'framer-motion';
import { useState } from 'react';
import { X, Camera, Car, Building2 } from 'lucide-react';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';
import ImageLightbox from '../components/ImageLightbox';
import SEO from '../components/SEO';

// Gallery image configuration
// Add your images to public/images/gallery/ folder and update this array
const GALLERY_IMAGES = [
  // Vehicle images - replace with actual filenames from your serendib trading folder
  { src: '/images/gallery/vehicle-1.jpg', category: 'vehicles', alt: 'Premium vehicle showcase' },
  { src: '/images/gallery/vehicle-2.jpg', category: 'vehicles', alt: 'Luxury car interior' },
  { src: '/images/gallery/vehicle-3.jpg', category: 'vehicles', alt: 'Showroom vehicle' },
  { src: '/images/gallery/vehicle-4.jpg', category: 'vehicles', alt: 'Vehicle detail shot' },
  { src: '/images/gallery/vehicle-5.jpg', category: 'vehicles', alt: 'Premium car exterior' },
  { src: '/images/gallery/vehicle-6.jpg', category: 'vehicles', alt: 'Luxury vehicle' },
  
  // Showroom images
  { src: '/images/gallery/showroom-1.jpg', category: 'showroom', alt: 'Serendib showroom interior' },
  { src: '/images/gallery/showroom-2.jpg', category: 'showroom', alt: 'Showroom display' },
  { src: '/images/gallery/showroom-3.jpg', category: 'showroom', alt: 'Vehicle presentation' },
  { src: '/images/gallery/showroom-4.jpg', category: 'showroom', alt: 'Showroom ambiance' },
  
  // Additional vehicle shots
  { src: '/images/gallery/vehicle-7.jpg', category: 'vehicles', alt: 'Car collection' },
  { src: '/images/gallery/vehicle-8.jpg', category: 'vehicles', alt: 'Premium selection' },
];

export default function Gallery() {
  const [filter, setFilter] = useState<'all' | 'vehicles' | 'showroom'>('all');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const filteredImages = filter === 'all' 
    ? GALLERY_IMAGES 
    : GALLERY_IMAGES.filter(img => img.category === filter);

  // Check if placeholder images exist (for initial setup)
  const hasPlaceholders = filteredImages.some(img => 
    img.src.includes('vehicle-') || img.src.includes('showroom-')
  );

  return (
    <div className="min-h-screen bg-[#0d0b09] text-white overflow-x-hidden">
      <SEO
        title="Gallery"
        description="Explore our collection of premium vehicles and showroom moments at Serendib Trading."
        canonical="/gallery"
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
          {filteredImages.length > 0 && !filteredImages.every(img => img.src.includes('placeholder')) ? (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {filteredImages.map((image, i) => (
                <motion.div
                  key={image.src}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setLightboxImage(image.src)}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/5 cursor-pointer"
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      // Show placeholder if image fails to load
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.classList.add('bg-white/10');
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
                      {image.category}
                    </span>
                    <p className="text-sm font-medium mt-1">{image.alt}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* Empty State - Instructions for adding images */
            <div className="text-center py-20 px-6">
              <div className="max-w-md mx-auto space-y-6">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                  <Camera className="w-10 h-10 text-[#D4AF37]/50" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight">Gallery Coming Soon</h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  To add your photos, copy them from:
                  <br />
                  <code className="text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-1 rounded text-xs">
                    C:
                  </code>
                </p>
                <div className="text-left bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                  <p className="text-sm text-white/60">Follow these steps:</p>
                  <ol className="space-y-3 text-sm text-white/80 list-decimal list-inside">
                    <li>Copy your images from the OneDrive folder</li>
                    <li>Paste them into <code className="text-[#D4AF37]">public/images/gallery/</code></li>
                    <li>Update the image list in <code className="text-[#D4AF37]">src/pages/Gallery.tsx</code></li>
                    <li>Refresh the page to see your gallery</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <WhatsAppFloat />

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
