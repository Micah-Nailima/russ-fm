import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { getAlbumImageFromData, handleImageError } from '@/lib/image-utils';
import type { Album } from '@/types/album';

interface GenresSectionProps {
  topGenres: [string, number][];
  randomizedGenreAlbums: Record<string, Album>;
}

export function GenresSection({ topGenres, randomizedGenreAlbums }: GenresSectionProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, x: -20 }}
        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl lg:text-3xl font-light text-foreground">Genres</h2>
        <Link to="/genres" className="text-primary hover:text-primary/80 transition-colors">
          Explore all genres →
        </Link>
      </motion.div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
        {topGenres.map(([genre, count], index) => {
          // Get pre-randomized representative album for this genre
          const representativeAlbum = randomizedGenreAlbums[genre];
          
          // Randomize polaroid rotation for natural scatter effect
          const rotation = (index % 2 === 0 ? 1 : -1) * (Math.random() * 6 + 2);
          
          return representativeAlbum ? (
            <motion.div
              key={genre}
              initial={{ opacity: 0, y: 30, rotate: rotation + 15 }}
              animate={inView ? { opacity: 1, y: 0, rotate: rotation } : { opacity: 0, y: 30, rotate: rotation + 15 }}
              transition={{ 
                delay: 0.3 + index * 0.15,
                type: "spring",
                stiffness: 100,
                damping: 12
              }}
              whileHover={{ 
                scale: 1.05, 
                rotate: 0,
                zIndex: 10,
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }}
              className="relative"
            >
              <Link to={representativeAlbum.uri_release} className="group block">
                {/* Polaroid Frame */}
                <motion.div 
                  className="bg-white p-4 pb-12 shadow-xl rounded-lg"
                  whileHover={{ boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)" }}
                >
                  {/* Photo */}
                  <div className="aspect-square overflow-hidden rounded-sm">
                    <motion.img
                      src={getAlbumImageFromData(representativeAlbum.uri_release, 'hi-res')}
                      alt={`${representativeAlbum.release_name} by ${representativeAlbum.release_artist}`}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                      onError={handleImageError}
                    />
                  </div>
                  
                  {/* Genre Label (handwritten style) */}
                  <div className="absolute bottom-4 left-0 right-0 px-4">
                    <p className="text-center text-slate-700 font-medium text-lg tracking-wide" 
                       style={{ fontFamily: '"Kalam", "Comic Sans MS", cursive' }}>
                      {genre}
                    </p>
                  </div>
                </motion.div>
                
                {/* Subtle tape effect */}
                <motion.div 
                  className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-16 h-6 bg-yellow-100/80 rounded-sm shadow-sm border border-yellow-200/50 -rotate-3"
                  initial={{ opacity: 0, y: -10 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                  transition={{ delay: 0.5 + index * 0.15 }}
                />
              </Link>
            </motion.div>
          ) : null;
        })}
      </div>
    </motion.section>
  );
}