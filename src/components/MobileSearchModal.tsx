import { useEffect, useRef, useState } from 'react';
import { X, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useMobileSearch } from '@/hooks/useSearch';
import { SearchResults } from './SearchResults';

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export function MobileSearchModal({ 
  isOpen, 
  onClose, 
  searchTerm, 
  setSearchTerm
}: MobileSearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [touchStart, setTouchStart] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  // Use search hook for Fuse.js powered search
  const { 
    query, 
    setQuery, 
    results, 
    isLoading, 
    isIndexing, 
    error 
  } = useMobileSearch();

  // Initialize local search term when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSearchTerm(searchTerm);
      setQuery(searchTerm);
    }
  }, [isOpen, searchTerm, setQuery]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Delay to ensure modal animation completes (200ms) plus small buffer
      const timeoutId = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          // On iOS, sometimes we need to trigger the keyboard explicitly
          if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            inputRef.current.click();
          }
        }
      }, 250);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  // Minimal focus management - only for cases where focus is completely lost
  useEffect(() => {
    if (!isOpen) return;

    const handleVisibilityChange = () => {
      // Refocus when returning to the page
      if (!document.hidden && isOpen && inputRef.current) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
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
    setLocalSearchTerm('');
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 md:hidden",
        "transition-all duration-200 ease-out",
        isOpen ? "visible" : "invisible"
      )}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/20",
          "transition-opacity duration-200",
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
          "transform transition-transform duration-200 ease-out",
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
                inputMode="search"
                placeholder="Search albums or artists..."
                value={localSearchTerm}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setLocalSearchTerm(newValue); // Update local state only
                  setQuery(newValue); // Update search query for results
                }}
                className={cn(
                  "h-11 pl-10 pr-11",
                  "text-base", // Larger text for mobile to prevent zoom
                  "bg-muted/50",
                  "border-none",
                  "rounded-full",
                  "focus-visible:ring-2 focus-visible:ring-primary"
                )}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                enterKeyHint="search"
              />
              {localSearchTerm && (
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
          <SearchResults
            results={results}
            isLoading={isLoading}
            isIndexing={isIndexing}
            error={error}
            searchTerm={localSearchTerm}
            onResultClick={() => {
              onClose();
              setLocalSearchTerm('');
              setQuery('');
            }}
            layout="list" // Use list layout for mobile
            showLimitMessage={true}
            showViewAllLink={true}
            className="py-4"
          />
        </div>
      </div>
    </div>
  );
}