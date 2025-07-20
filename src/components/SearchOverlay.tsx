import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useInstantSearch } from '@/hooks/useSearch';
import { SearchResults } from './SearchResults';


interface SearchOverlayProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isVisible: boolean;
  onClose: () => void;
}

export function SearchOverlay({ searchTerm, setSearchTerm, isVisible, onClose }: SearchOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  
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


  // Sync search term with the hook
  useEffect(() => {
    setQuery(searchTerm);
  }, [searchTerm, setQuery]);

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
    onClose();
    setSearchTerm('');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/20" style={{ top: '112px' }}>
      <div className="container mx-auto px-4">
        <div ref={overlayRef} className="bg-background border rounded-lg shadow-2xl max-h-[calc(100vh-140px)] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg font-semibold">
                  {searchTerm.trim() ? (
                    <>
                      {isIndexing ? (
                        <>Indexing collection...</>
                      ) : error ? (
                        <>Search error: {error}</>
                      ) : results.length > 0 ? (
                        <>Found <strong>{results.length}</strong> result{results.length !== 1 ? 's' : ''} for "<strong>{searchTerm}</strong>"</>
                      ) : isLoading ? (
                        <>Searching for "<strong>{searchTerm}</strong>"...</>
                      ) : (
                        <>No results for "<strong>{searchTerm}</strong>"</>
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
              searchTerm={searchTerm}
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