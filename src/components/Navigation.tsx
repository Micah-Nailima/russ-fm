import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "./Logo";
import { ThemeToggle } from "./theme-toggle";
import { SearchOverlay } from "./SearchOverlay";
import { SearchFAB } from "./SearchFAB";
import { MobileSearchModal } from "./MobileSearchModal";
import { Search, Menu, X } from "lucide-react";
import { Link, useLocation } from 'react-router-dom';

export function Navigation() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check if we're on a page where search overlay should be disabled
  const isSearchOverlayDisabled = () => {
    // Only disable on the exact home page, allow search everywhere else
    return location.pathname === '/';
  };

  const handleSearchFocus = () => {
    if (isMobile) {
      setMobileSearchOpen(true);
    } else {
      setSearchOverlayOpen(true);
    }
  };

  const closeSearchOverlay = () => {
    setSearchOverlayOpen(false);
  };

  const closeMobileSearch = () => {
    setMobileSearchOpen(false);
    setMobileMenuOpen(false); // Also close mobile menu if open
  };

  return (
    <div className="min-h-0">
      <div className="fixed top-6 inset-x-0 z-50">
        <div className="container mx-auto px-4">
          <nav className="h-16 bg-background border dark:border-slate-700/70 rounded-full">
            <div className="h-full flex items-center justify-between px-6">
              <div className="flex items-center gap-8">
                <Link to="/albums/1">
                  <Logo className="shrink-0" />
                </Link>

                {/* Center navigation links */}
                <div className="hidden md:flex items-center gap-6">
                  <Link 
                    to="/albums/1" 
                    className={`text-sm font-medium transition-all duration-200 hover:text-foreground relative py-2 ${
                      location.pathname === '/' || location.pathname.startsWith('/albums') 
                        ? 'text-primary font-semibold' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    Albums
                    {(location.pathname === '/' || location.pathname.startsWith('/albums')) && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                  </Link>
                  <Link 
                    to="/artists/1" 
                    className={`text-sm font-medium transition-all duration-200 hover:text-foreground relative py-2 ${
                      location.pathname.startsWith('/artists') 
                        ? 'text-primary font-semibold' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    Artists
                    {location.pathname.startsWith('/artists') && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                  </Link>
                  <Link 
                    to="/stats" 
                    className={`text-sm font-medium transition-all duration-200 hover:text-foreground relative py-2 ${
                      location.pathname === '/stats' 
                        ? 'text-primary font-semibold' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    Stats
                    {location.pathname === '/stats' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                  </Link>
                  <Link 
                    to="/genres" 
                    className={`text-sm font-medium transition-all duration-200 hover:text-foreground relative py-2 ${
                      location.pathname === '/genres' 
                        ? 'text-primary font-semibold' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    Genres
                    {location.pathname === '/genres' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                  </Link>
                  <Link 
                    to="/random" 
                    className={`text-sm font-medium transition-all duration-200 hover:text-foreground relative py-2 ${
                      location.pathname === '/random' 
                        ? 'text-primary font-semibold' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    Random
                    {location.pathname === '/random' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Desktop Search Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex rounded-full"
                  onClick={handleSearchFocus}
                >
                  <Search className="h-5 w-5" />
                </Button>

                {/* Desktop Theme Toggle */}
                <div className="hidden md:block">
                  <ThemeToggle />
                </div>

                {/* Mobile Burger Menu Button */}
                <Button
                  size="icon"
                  variant="ghost"
                  className="md:hidden rounded-full"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </nav>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-2 bg-background border dark:border-slate-700/70 rounded-lg shadow-lg">
              <div className="p-4 space-y-4">
                {/* Mobile Navigation Links */}
                <div className="space-y-2">
                  <Link
                    to="/albums/1"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted ${
                      location.pathname === '/' || location.pathname.startsWith('/albums')
                        ? 'text-foreground bg-muted'
                        : 'text-muted-foreground'
                    }`}
                  >
                    Albums
                  </Link>
                  <Link
                    to="/artists/1"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted ${
                      location.pathname.startsWith('/artists')
                        ? 'text-foreground bg-muted'
                        : 'text-muted-foreground'
                    }`}
                  >
                    Artists
                  </Link>
                  <Link
                    to="/stats"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted ${
                      location.pathname === '/stats'
                        ? 'text-foreground bg-muted'
                        : 'text-muted-foreground'
                    }`}
                  >
                    Stats
                  </Link>
                  <Link
                    to="/genres"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted ${
                      location.pathname === '/genres'
                        ? 'text-foreground bg-muted'
                        : 'text-muted-foreground'
                    }`}
                  >
                    Genres
                  </Link>
                  <Link
                    to="/random"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted ${
                      location.pathname === '/random'
                        ? 'text-foreground bg-muted'
                        : 'text-muted-foreground'
                    }`}
                  >
                    Random
                  </Link>
                </div>

                {/* Mobile Theme Toggle */}
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-sm font-medium">Theme</span>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Overlay for Desktop */}
      <SearchOverlay 
        isVisible={searchOverlayOpen}
        onClose={closeSearchOverlay}
      />
      

      {/* Mobile Search FAB */}
      <SearchFAB onClick={() => setMobileSearchOpen(true)} />

      {/* Mobile Search Modal */}
      <MobileSearchModal
        key="mobile-search-modal"
        isOpen={mobileSearchOpen}
        onClose={closeMobileSearch}
      />
    </div>
  );
}