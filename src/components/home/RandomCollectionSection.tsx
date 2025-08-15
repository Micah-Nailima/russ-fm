import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { getAlbumImageFromData, handleImageError } from '@/lib/image-utils';
import type { Album } from '@/types/album';

interface RandomCollectionSectionProps {
  randomCollectionItems: Album[];
  randomFeaturedIndex: number;
  handleRandomNavigation: (index: number) => void;
}

export function RandomCollectionSection({
  randomCollectionItems,
  randomFeaturedIndex,
  handleRandomNavigation
}: RandomCollectionSectionProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  console.log('RandomCollectionSection:', {
    itemsLength: randomCollectionItems.length,
    currentIndex: randomFeaturedIndex,
    currentItem: randomCollectionItems[randomFeaturedIndex],
    inView
  });

  if (randomCollectionItems.length === 0 || !randomCollectionItems[randomFeaturedIndex]) {
    console.log('RandomCollectionSection: Returning null due to missing data');
    return null;
  }

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="flex items-center justify-between mb-12"
        initial={{ opacity: 0, x: -20 }}
        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl lg:text-3xl font-light text-foreground">From the Collection</h2>
        <Link to="/albums" className="text-primary hover:text-primary/80 transition-colors">
          Discover more →
        </Link>
      </motion.div>
      
      {/* Classic Record Player Layout */}
      <div className="max-w-6xl mx-auto flex justify-center">
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Navigation Controls */}
            <div className="flex justify-between items-center mb-8">
              <motion.button
                onClick={() => {
                  if (randomCollectionItems.length > 0) {
                    const prevIndex = (randomFeaturedIndex - 1 + randomCollectionItems.length) % randomCollectionItems.length;
                    handleRandomNavigation(prevIndex);
                  }
                }}
                className="group flex items-center justify-center w-12 h-12 bg-background border-2 border-border rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </motion.button>

              <div className="text-center">
                <div className="flex gap-2 justify-center mb-2">
                  {randomCollectionItems.map((_, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleRandomNavigation(index)}
                      className="w-2 h-2 rounded-full transition-colors"
                      style={{
                        backgroundColor: index === randomFeaturedIndex ? 'rgb(var(--primary))' : 'rgb(var(--muted-foreground))',
                      }}
                      whileHover={{ scale: 1.2 }}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {randomFeaturedIndex + 1} of {randomCollectionItems.length}
                </p>
              </div>

              <motion.button
                onClick={() => {
                  if (randomCollectionItems.length > 0) {
                    const nextIndex = (randomFeaturedIndex + 1) % randomCollectionItems.length;
                    handleRandomNavigation(nextIndex);
                  }
                }}
                className="group flex items-center justify-center w-12 h-12 bg-background border-2 border-border rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </motion.button>
            </div>

            {/* Main Record Player */}
            <div className="relative flex items-center justify-start min-h-[600px] lg:min-h-[525px] pl-0">
              {/* Album Cover Display */}
              <div className="relative z-20">
                <Link to={randomCollectionItems[randomFeaturedIndex].uri_release} className="block group">
                  <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] lg:w-[525px] lg:h-[525px] relative">
                    {/* Album Cover */}
                    <img
                      src={getAlbumImageFromData(randomCollectionItems[randomFeaturedIndex].uri_release, 'hi-res')}
                      alt={`${randomCollectionItems[randomFeaturedIndex].release_name} by ${randomCollectionItems[randomFeaturedIndex].release_artist}`}
                      className="w-full h-full object-cover rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-500"
                      onError={handleImageError}
                    />
                  </div>
                </Link>
              </div>

              {/* Spinning Vinyl Record - Positioned behind album cover */}
              <div className="absolute left-[180px] lg:left-[300px] z-10">
                <div className="relative w-[280px] h-[280px] md:w-[380px] md:h-[380px] lg:w-[520px] lg:h-[520px]">
                  {/* Vinyl Record */}
                  <motion.div 
                    className="w-full h-full rounded-full shadow-2xl relative cursor-pointer"
                    style={{
                      background: 'radial-gradient(circle at center, #111 0%, #0a0a0a 50%, #000 100%)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 0 50px rgba(0,0,0,0.8)'
                    }}
                    animate={{ 
                      rotate: inView ? 360 : 0
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "linear"
                    }}
                    whileHover={{ scale: 1.02 }}
                  >
                    {/* Record Label in center - smaller like reference */}
                    <div className="absolute inset-[35%] rounded-full overflow-hidden shadow-lg">
                      <img
                        src={getAlbumImageFromData(randomCollectionItems[randomFeaturedIndex].uri_release, 'medium')}
                        alt="Record Label"
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                    </div>
                    
                    {/* Center Spindle Hole */}
                    <div className="absolute inset-1/2 w-2 h-2 -ml-1 -mt-1 bg-slate-900 rounded-full shadow-inner border border-slate-700" />
                    
                    {/* Vinyl Grooves - like reference CSS */}
                    {[...Array(25)].map((_, grooveIndex) => (
                      <div
                        key={grooveIndex}
                        className="absolute inset-0 border border-white/[0.01] rounded-full"
                        style={{
                          padding: `${grooveIndex * 8}px`
                        }}
                      />
                    ))}
                    
                    {/* Vinyl texture overlays - matching reference */}
                    <div 
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{
                        background: `repeating-conic-gradient(
                          from 0deg,
                          transparent 0deg,
                          rgba(255,255,255,0.02) 0.5deg,
                          transparent 1deg
                        )`
                      }}
                    />
                    
                    <div 
                      className="absolute inset-0 w-[90%] h-[90%] rounded-full pointer-events-none"
                      style={{
                        background: `repeating-radial-gradient(
                          circle at center,
                          transparent 0px,
                          rgba(255,255,255,0.01) 1px,
                          transparent 2px,
                          transparent 8px
                        )`,
                        top: '5%',
                        left: '5%'
                      }}
                    />
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Album Information */}
            <div className="mt-12 text-center space-y-4">
              <Link to={randomCollectionItems[randomFeaturedIndex].uri_release} className="group">
                <h3 className="text-3xl font-light text-foreground group-hover:text-primary transition-colors">
                  {randomCollectionItems[randomFeaturedIndex].release_name}
                </h3>
              </Link>
              <p className="text-xl text-muted-foreground font-medium">
                {randomCollectionItems[randomFeaturedIndex].release_artist}
              </p>
              <p className="text-muted-foreground">
                {randomCollectionItems[randomFeaturedIndex].date_release_year}
              </p>
              
              {/* Genres */}
              {randomCollectionItems[randomFeaturedIndex].genre_names.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {randomCollectionItems[randomFeaturedIndex].genre_names.slice(0, 3).map((genre) => (
                    <Link 
                      key={genre}
                      to={`/albums/1?genre=${encodeURIComponent(genre)}`}
                      className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {genre}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}