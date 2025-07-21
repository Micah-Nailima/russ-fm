import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useInstantSearch } from '@/hooks/useSearch';
import { SearchResults } from './SearchResults';


interface SearchOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isVisible, onClose }: SearchOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  
  // Use the search hook for Fuse.js powered search
  const { 
    query, 
    setQuery, 
    results, 
    isLoading, 
    isIndexing, 
    error,
    isReady 
  } = useInstantSearch();

  // Update search query when local term changes
  useEffect(() => {
    setQuery(localSearchTerm);
  }, [localSearchTerm, setQuery]);

  // Close overlay when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, onClose]);

  const handleResultClick = () => {
    setLocalSearchTerm('');
    onClose();
  };

  // Clear search when closing
  useEffect(() => {
    if (!isVisible) {
      setLocalSearchTerm('');
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/20" style={{ top: '112px' }}>
      <div className="container mx-auto px-4">
        <div ref={overlayRef} className="bg-background border rounded-lg shadow-2xl max-h-[calc(100vh-140px)] overflow-hidden">
          {/* Search Input */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                placeholder="Search albums and artists..."
                className="w-full pl-10 pr-10 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              {localSearchTerm && (
                <button
                  onClick={() => setLocalSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Header */}
          <div className="px-4 py-2 bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">
                  {localSearchTerm.trim() ? (
                    <>
                      {isIndexing ? (
                        <>Indexing collection...</>
                      ) : error ? (
                        <>Search error: {error}</>
                      ) : results.length > 0 ? (
                        <>Found <strong>{results.length}</strong> result{results.length !== 1 ? 's' : ''} for "<strong>{localSearchTerm}</strong>"</>
                      ) : isLoading ? (
                        <>Searching for "<strong>{localSearchTerm}</strong>"...</>
                      ) : (
                        <>No results for "<strong>{localSearchTerm}</strong>"</>
                      )}
                    </>
                  ) : isIndexing ? (
                    'Preparing search...'
                  ) : (
                    'Start typing to search...'
                  )}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            <SearchResults
              results={results}
              isLoading={isLoading}
              isIndexing={isIndexing}
              error={error}
              searchTerm={localSearchTerm}
              onResultClick={handleResultClick}
              layout="grid"
              showLimitMessage={true}
              showViewAllLink={true}
              className="p-4"
            />
          </div>
        </div>
      </div>
    </div>
  );
}