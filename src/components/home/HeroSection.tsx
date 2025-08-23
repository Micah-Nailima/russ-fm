import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { appConfig } from '@/config/app.config';
import { getGenreColor, getGenreTextColor } from '@/lib/genreColors';
import type { ColorPalette } from '@/lib/colorExtractor';
import { getReadableTextColor } from '@/lib/color-utils';
import { getAlbumImageFromData, handleImageError } from '@/lib/image-utils';
import type { Album } from '@/types/album';

interface HeroSectionProps {
  currentFeatured: Album | null;
  featuredAlbums: Album[];
  featuredIndex: number;
  setFeaturedIndex: (index: number) => void;
  currentPalette: ColorPalette | null;
}

export function HeroSection({
  currentFeatured,
  featuredAlbums,
  featuredIndex,
  setFeaturedIndex,
  currentPalette
}: HeroSectionProps) {
  if (!currentFeatured) return null;

  return (
    <motion.section 
      className="relative rounded-3xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Full background album artwork with blur */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${featuredIndex}`}
          className="absolute inset-0 w-full h-full"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
        >
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat filter blur-2xl"
            style={{
              backgroundImage: `url(${getAlbumImageFromData(currentFeatured.uri_release, 'medium')})`,
              transform: 'scale(1.1)'
            }}
          />
          
          {/* Dynamic gradient overlay */}
          <div 
            className="absolute inset-0"
            style={{
              background: currentPalette 
                ? `linear-gradient(135deg, 
                    ${currentPalette.background}E6 0%, 
                    ${currentPalette.background}B3 25%,
                    ${currentPalette.muted}80 50%,
                    ${currentPalette.accent}40 75%,
                    ${currentPalette.background}CC 100%)`
                : 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.8) 100%)'
            }}
          />
          
          {/* Color bleeding effect */}
          {currentPalette && (
            <>
              <div 
                className="absolute top-0 left-0 w-1/3 h-1/3 opacity-30"
                style={{
                  background: `radial-gradient(ellipse at top left, ${currentPalette.accent}60, transparent 70%)`
                }}
              />
              <div 
                className="absolute bottom-0 right-0 w-1/2 h-1/2 opacity-20"
                style={{
                  background: `radial-gradient(ellipse at bottom right, ${currentPalette.muted}80, transparent 70%)`
                }}
              />
            </>
          )}
        </motion.div>
      </AnimatePresence>
      
      <div className="relative grid lg:grid-cols-2 gap-12 p-8 lg:p-16 min-h-[500px]">
        {/* Floating Album Artwork - Full Left Side */}
        <div className="relative group flex items-center justify-center lg:justify-start">
          <AnimatePresence mode="wait">
            <motion.div
              key={featuredIndex}
              className="relative w-80 h-80 lg:w-full lg:h-full lg:max-w-[500px] lg:max-h-[500px] aspect-square"
              initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateY: 10 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
              style={{ perspective: '1000px' }}
            >
              {/* Glow effect behind album */}
              <div 
                className="absolute -inset-8 rounded-3xl opacity-60 blur-2xl"
                style={{
                  background: currentPalette 
                    ? `radial-gradient(ellipse at center, ${currentPalette.accent}80, ${currentPalette.muted}40, transparent 70%)`
                    : 'radial-gradient(ellipse at center, rgba(255,255,255,0.3), transparent 70%)'
                }}
              />
              
              {/* Main album cover */}
              <div 
                className="relative rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/20 backdrop-blur-sm"
                style={{
                  boxShadow: currentPalette 
                    ? `0 25px 50px -12px ${currentPalette.background}80, 0 0 0 1px ${currentPalette.accent}30`
                    : '0 25px 50px -12px rgba(0,0,0,0.5)'
                }}
              >
                <img
                  src={getAlbumImageFromData(currentFeatured.uri_release, 'medium')}
                  srcSet={`
                    ${getAlbumImageFromData(currentFeatured.uri_release, 'small')} 400w,
                    ${getAlbumImageFromData(currentFeatured.uri_release, 'medium')} 800w,
                    ${getAlbumImageFromData(currentFeatured.uri_release, 'hi-res')} 1400w
                  `}
                  sizes="(max-width: 768px) 400px, (max-width: 1024px) 500px, 600px"
                  alt={`${currentFeatured.release_name} by ${currentFeatured.release_artist}`}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                  loading="eager"
                />
                
                {/* Subtle gradient overlay on artwork */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: currentPalette 
                      ? `linear-gradient(135deg, transparent 0%, ${currentPalette.accent}10 100%)`
                      : 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.05) 100%)'
                  }}
                />
              </div>
              
              {/* Reflection effect */}
              <div 
                className="absolute top-full left-0 w-full h-1/2 rounded-b-3xl opacity-20 blur-sm transform scale-y-[-1] origin-top"
                style={{
                  background: `url(${getAlbumImageFromData(currentFeatured.uri_release, 'medium')})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%)'
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Album Info - Right Aligned */}
        <AnimatePresence mode="wait">
          <motion.div
            key={featuredIndex}
            className="flex flex-col justify-center text-center lg:text-right space-y-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 1.0, delay: 0.4, ease: "easeInOut" }}
          >
            <div className="space-y-6">
              <motion.h1 
                className="text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-light leading-tight"
                style={{ 
                  color: '#ffffff',
                  textShadow: currentPalette 
                    ? `0 4px 20px ${currentPalette.background}80, 0 2px 4px rgba(0,0,0,0.5)`
                    : '0 4px 20px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.8)'
                }}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.8, type: "spring", stiffness: 100 }}
              >
                {currentFeatured.release_name}
              </motion.h1>
              <motion.p 
                className="text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-normal"
                style={{ 
                  color: '#ffffff',
                  textShadow: currentPalette 
                    ? `0 4px 20px ${currentPalette.background}80, 0 2px 4px rgba(0,0,0,0.5)`
                    : '0 4px 20px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.8)'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                {currentFeatured.release_artist}
              </motion.p>
            </div>
            
            <motion.div 
              className="flex flex-wrap gap-3 justify-center lg:justify-end"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {currentFeatured.genre_names.slice(0, 3).map((genre, index) => (
                <motion.div
                  key={genre}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to={`/albums/1?genre=${encodeURIComponent(genre)}`}>
                    <Badge
                      className="px-4 py-2 text-base font-medium cursor-pointer"
                      style={{
                        backgroundColor: getGenreColor(genre),
                        color: getGenreTextColor(getGenreColor(genre))
                      }}
                    >
                      {genre}
                    </Badge>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="flex flex-col items-center lg:items-end gap-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Button 
                asChild 
                size="lg" 
                className="rounded-full font-medium px-10 py-4 text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                style={{
                  backgroundColor: currentPalette?.accent || 'rgb(var(--primary))',
                  color: currentPalette?.accent 
                    ? getReadableTextColor(currentPalette.accent)
                    : 'rgb(var(--primary-foreground))',
                  boxShadow: currentPalette?.accent 
                    ? `0 10px 25px -5px ${currentPalette.accent}40, 0 4px 6px -2px ${currentPalette.accent}20`
                    : undefined
                }}
              >
                <Link to={currentFeatured.uri_release}>
                  {appConfig.homepage.hero.exploreButtonText}
                </Link>
              </Button>
              
              {/* Navigation dots - Larger and more prominent */}
              <div className="flex items-center gap-4">
                {featuredAlbums.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setFeaturedIndex(index)}
                    className="relative group"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {/* Background glow */}
                    <motion.div
                      className="absolute inset-0 rounded-full blur-sm"
                      style={{
                        backgroundColor: currentPalette?.accent || '#ffffff',
                        opacity: index === featuredIndex ? 0.6 : 0
                      }}
                      animate={{
                        scale: index === featuredIndex ? 2.2 : 1,
                        opacity: index === featuredIndex ? 0.6 : 0
                      }}
                      transition={{ duration: 0.3 }}
                    />
                    
                    {/* Main dot */}
                    <motion.div
                      className="relative rounded-full shadow-lg"
                      style={{
                        backgroundColor: index === featuredIndex 
                          ? (currentPalette?.accent || '#ffffff')
                          : 'rgba(255,255,255,0.5)',
                        width: index === featuredIndex ? 20 : 12,
                        height: index === featuredIndex ? 20 : 12,
                      }}
                      animate={{
                        width: index === featuredIndex ? 20 : 12,
                        height: index === featuredIndex ? 20 : 12,
                      }}
                      transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                    />
                    
                    {/* Active indicator ring */}
                    {index === featuredIndex && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-2"
                        style={{
                          borderColor: currentPalette?.accent || '#ffffff',
                          width: 28,
                          height: 28,
                          left: -4,
                          top: -4
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.7 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.section>
  );
}