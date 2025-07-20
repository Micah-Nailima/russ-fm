import { useEffect, useRef, useState } from 'react';
import { X, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  children?: React.ReactNode; // For search results
}

export function MobileSearchModal({ 
  isOpen, 
  onClose, 
  searchTerm, 
  setSearchTerm,
  children 
}: MobileSearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [touchStart, setTouchStart] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure animation has started
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle swipe down to close
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientY;
    const swipeDistance = touchEnd - touchStart;
    
    // If swiped down more than 50px, close modal
    if (swipeDistance > 50) {
      onClose();
    }
  };

  // Handle back button on Android
  useEffect(() => {
    if (!isOpen) return;

    const handlePopState = () => {
      onClose();
    };

    // Push a new state when modal opens
    window.history.pushState({ modal: true }, '');
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // Go back if modal is closing
      if (window.history.state?.modal) {
        window.history.back();
      }
    };
  }, [isOpen, onClose]);

  const handleClear = () => {
    setSearchTerm('');
    inputRef.current?.focus();
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 md:hidden",
        "transition-all duration-300 ease-out",
        isOpen ? "visible" : "invisible"
      )}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/20",
          "transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={cn(
          "absolute inset-x-0 bottom-0 top-0",
          "bg-background",
          "transform transition-transform duration-300 ease-out",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Swipe indicator */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              className="h-11 w-11 rounded-full shrink-0"
              aria-label="Close search"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="search"
                placeholder="Search albums or artists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  "h-11 pl-10 pr-11",
                  "text-base", // Larger text for mobile
                  "bg-muted/50",
                  "border-none",
                  "rounded-full",
                  "focus-visible:ring-2 focus-visible:ring-primary"
                )}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                enterKeyHint="search"
              />
              {searchTerm && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleClear}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full"
                  aria-label="Clear search"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Search results */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-safe">
          {children || (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                {searchTerm ? 'Searching...' : 'Start typing to search'}
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Find albums, artists, and genres
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}