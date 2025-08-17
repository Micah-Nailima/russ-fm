import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shuffle } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { appConfig } from '@/config/app.config';
import { getAlbumImageFromData, handleImageError } from '@/lib/image-utils';
import type { Album } from '@/types/album';

interface RandomCollectionSectionProps {
  randomCollectionItems: Album[];
  onRefresh?: () => void;
}

export function RandomCollectionSection({
  randomCollectionItems,
  onRefresh
}: RandomCollectionSectionProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [hasTriggered, setHasTriggered] = useState(false);

  // Ensure animation triggers even if component mounts in view
  useEffect(() => {
    if (inView && !hasTriggered) {
      setHasTriggered(true);
    }
  }, [inView, hasTriggered]);

  // Fallback: trigger after a short delay if still not triggered
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasTriggered) {
        setHasTriggered(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [hasTriggered]);

  const shouldAnimate = inView || hasTriggered;

  if (randomCollectionItems.length === 0) {
    return null;
  }

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, x: -20 }}
        animate={shouldAnimate ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-2xl lg:text-3xl font-light text-foreground">From the Collection</h2>
          {onRefresh && (
            <motion.button
              onClick={onRefresh}
              className="group flex items-center justify-center w-8 h-8 bg-secondary hover:bg-primary rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="Shuffle collection"
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
        <Link to="/albums" className="text-primary hover:text-primary/80 transition-colors">
          Discover more →
        </Link>
      </motion.div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {randomCollectionItems.slice(0, appConfig.homepage.randomCollection.displayCount).map((album, index) => (
          <motion.div
            key={album.uri_release}
            initial={{ opacity: 0, y: 20 }}
            animate={shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Link to={album.uri_release} className="group space-y-3 block">
              <motion.div 
                className="aspect-square rounded-xl overflow-hidden shadow-lg"
                whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <img
                  src={getAlbumImageFromData(album.uri_release, 'medium')}
                  alt={`${album.release_name} by ${album.release_artist}`}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                  loading="lazy"
                />
              </motion.div>
              <div className="space-y-1">
                <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                  {album.release_name}
                </h3>
                <p className="text-muted-foreground text-xs">
                  {album.release_artist}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}