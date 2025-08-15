import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Shuffle } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { appConfig } from '@/config/app.config';
import { handleImageError } from '@/lib/image-utils';
import type { Artist } from '@/types/album';

interface RandomArtistsSectionProps {
  randomArtists: Artist[];
  onRefresh?: () => void;
}

export function RandomArtistsSection({
  randomArtists,
  onRefresh
}: RandomArtistsSectionProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  if (randomArtists.length === 0) {
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
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-2xl lg:text-3xl font-light text-foreground">Random Artists</h2>
          {onRefresh && (
            <motion.button
              onClick={onRefresh}
              className="group flex items-center justify-center w-8 h-8 bg-secondary hover:bg-primary rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="Shuffle artists"
            >
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <Shuffle className="w-4 h-4 text-secondary-foreground group-hover:text-primary-foreground transition-colors" />
              </motion.div>
            </motion.button>
          )}
        </div>
        <Link to="/artists" className="text-primary hover:text-primary/80 transition-colors">
          View all artists →
        </Link>
      </motion.div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {randomArtists.slice(0, appConfig.homepage.randomArtists.displayCount).map((artist, index) => {
          // Randomize polaroid rotation for natural scatter effect
          const rotation = (index % 2 === 0 ? 1 : -1) * (Math.random() * 6 + 2);
          
          return (
            <motion.div
              key={artist.name}
              initial={{ opacity: 0, y: 30, rotate: rotation + 15 }}
              animate={{ opacity: 1, y: 0, rotate: rotation }}
              transition={{ 
                delay: 0.3 + index * 0.1,
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
              <Link to={artist.uri} className="group block">
                {/* Polaroid Frame */}
                <motion.div 
                  className="bg-white p-3 pb-8 shadow-xl rounded-lg"
                  whileHover={{ boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)" }}
                >
                  {/* Photo */}
                  <div className="aspect-square overflow-hidden rounded-sm">
                    <motion.img
                      src={artist.avatar}
                      alt={artist.name}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                      onError={handleImageError}
                    />
                  </div>
                  
                  {/* Artist Name (handwritten style) */}
                  <div className="absolute bottom-3 left-0 right-0 px-3">
                    <p className="text-center text-slate-700 font-medium text-sm tracking-wide line-clamp-2" 
                       style={{ fontFamily: '"Kalam", "Comic Sans MS", cursive' }}>
                      {artist.name}
                    </p>
                  </div>
                </motion.div>
                
                {/* Subtle tape effect */}
                <motion.div 
                  className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-12 h-4 bg-yellow-100/80 rounded-sm shadow-sm border border-yellow-200/50 -rotate-3"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}