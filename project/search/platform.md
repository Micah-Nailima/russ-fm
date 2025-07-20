# Platform-Specific Search Considerations

## Mobile Platforms (iOS & Android)

### Screen Size Constraints
- **Viewport**: 320px - 428px width typically
- **Safe Areas**: Account for notches, home indicators
- **Orientation**: Support both portrait and landscape
- **Keyboard**: Virtual keyboard takes ~50% of screen

### iOS Specific
```typescript
// Safe area handling
.search-modal {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

// Momentum scrolling
.search-results {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
}
```

### Android Specific
- **Back Button**: Hardware/gesture back should close search
- **Material Design**: Follow MD3 search patterns
- **Keyboard Types**: Use `inputmode="search"` for search keyboards

### Mobile Interactions
- **Touch Targets**: Minimum 44px (iOS) / 48px (Android)
- **Swipe Gestures**: Down to dismiss, horizontal for filters
- **Long Press**: Show context menu (copy, share)
- **Pull to Refresh**: Update search results

### Performance Considerations
- **Network**: Assume slow 3G (50KB/s)
- **Memory**: Limit collection size in memory
- **Battery**: Minimize background processing
- **Data Usage**: Option for reduced data mode

### Fuse.js Mobile Optimization
```typescript
// Mobile-optimized Fuse configuration
const mobileFuseOptions = {
  // Reduced keys for mobile performance
  keys: [
    { name: 'release_name', weight: 0.5 },
    { name: 'release_artist', weight: 0.3 },
    { name: 'genre_names', weight: 0.2 }
  ],
  // More lenient threshold for touch typing
  threshold: 0.4,
  // Limit results for performance
  limit: 50,
  // Disable sorting on low-end devices
  shouldSort: !isLowEndDevice()
};

// Progressive loading for large collections
const initializeMobileSearch = async () => {
  // Load collection in chunks
  const CHUNK_SIZE = 500;
  const collection = await loadCollectionInChunks(CHUNK_SIZE);
  
  // Initialize Fuse with first chunk immediately
  const fuse = new Fuse(collection.slice(0, CHUNK_SIZE), mobileFuseOptions);
  
  // Add remaining chunks in background
  requestIdleCallback(() => {
    for (let i = CHUNK_SIZE; i < collection.length; i += CHUNK_SIZE) {
      fuse.add(...collection.slice(i, i + CHUNK_SIZE));
    }
  });
};
```

## Tablet Platforms

### iPad/Android Tablets
- **Viewport**: 768px - 1366px width
- **Split View**: Support multitasking layouts
- **Keyboard**: Physical keyboard support
- **Hover States**: Some tablets support hover

### Tablet Layout
```css
/* Tablet-specific grid */
@media (min-width: 768px) and (max-width: 1024px) {
  .search-results-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .search-overlay {
    max-width: 600px;
    margin: 0 auto;
  }
}
```

### Tablet Features
- **Sidebar Search**: Persistent search in landscape
- **Keyboard Shortcuts**: Cmd/Ctrl+K for search
- **Multi-Column**: Show results in 2-3 columns
- **Preview Pane**: Quick preview without navigation

## Desktop Platforms

### Large Screens
- **Viewport**: 1024px+ width
- **Multi-Window**: Support side-by-side windows
- **High DPI**: Support retina displays
- **Mouse**: Precise pointing device

### Desktop Interactions
- **Keyboard Navigation**: Arrow keys, Tab, Enter
- **Shortcuts**: Cmd/Ctrl+K, Escape, Cmd/Ctrl+F
- **Right Click**: Context menus
- **Drag & Drop**: Add to playlists

### Desktop Search Features
```typescript
// Keyboard shortcuts
useEffect(() => {
  const handleKeyboard = (e: KeyboardEvent) => {
    // Cmd/Ctrl + K to focus search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      focusSearch();
    }
    
    // Escape to close search
    if (e.key === 'Escape' && searchOpen) {
      closeSearch();
    }
    
    // Arrow keys for navigation
    if (searchOpen && ['ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      navigateResults(e.key === 'ArrowUp' ? -1 : 1);
    }
  };
  
  window.addEventListener('keydown', handleKeyboard);
  return () => window.removeEventListener('keydown', handleKeyboard);
}, [searchOpen]);
```

### Fuse.js Desktop Optimization
```typescript
// Desktop-optimized Fuse configuration
const desktopFuseOptions = {
  // All keys with fine-tuned weights
  keys: [
    { name: 'release_name', weight: 0.35 },
    { name: 'release_artist', weight: 0.25 },
    { name: 'artists.name', weight: 0.20 },
    { name: 'genre_names', weight: 0.10 },
    { name: 'label', weight: 0.05 },
    { name: 'year', weight: 0.05 }
  ],
  // Stricter threshold for keyboard typing
  threshold: 0.2,
  // More results for larger screens
  limit: 100,
  // Advanced search features
  useExtendedSearch: true,
  // Include all match data
  includeMatches: true,
  // Full sorting enabled
  shouldSort: true
};

// Leverage Web Workers for indexing
const initializeDesktopSearch = async () => {
  // Create worker for Fuse indexing
  const searchWorker = new Worker('/search-worker.js');
  
  // Send collection to worker
  searchWorker.postMessage({
    type: 'INDEX',
    data: await fetch('/collection.json').then(r => r.json()),
    options: desktopFuseOptions
  });
  
  // Handle search queries
  return (query: string) => {
    return new Promise((resolve) => {
      searchWorker.postMessage({ type: 'SEARCH', query });
      searchWorker.onmessage = (e) => resolve(e.data);
    });
  };
};
```

## Progressive Web App (PWA)

### Offline Support
- **Service Worker**: Cache search index
- **IndexedDB**: Store recent searches
- **Sync**: Background sync for updates

### App-Like Features
- **Install Prompt**: Add to home screen
- **Shortcuts**: Quick actions from app icon
- **Share Target**: Receive shared content

## Responsive Breakpoints

```scss
// Mobile First Approach
$breakpoints: (
  'sm': 640px,   // Small phones
  'md': 768px,   // Large phones/small tablets
  'lg': 1024px,  // Tablets/small laptops
  'xl': 1280px,  // Desktops
  '2xl': 1536px  // Large desktops
);

// Search-specific breakpoints
.search-container {
  // Mobile (default)
  position: fixed;
  inset: 0;
  
  @media (min-width: 768px) {
    // Tablet: Modal
    position: fixed;
    inset: auto;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 600px;
    max-height: 80vh;
  }
  
  @media (min-width: 1024px) {
    // Desktop: Dropdown
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    max-width: 800px;
  }
}
```

## Accessibility Across Platforms

### Screen Readers
- **ARIA Labels**: Descriptive labels for all elements
- **Live Regions**: Announce search results
- **Focus Management**: Logical tab order

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .search-modal {
    animation: none;
    transition: opacity 0.1s;
  }
}
```

### High Contrast
```css
@media (prefers-contrast: high) {
  .search-input {
    border: 2px solid;
  }
}
```

## Platform Detection

```typescript
const getPlatform = () => {
  const ua = navigator.userAgent;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
  const isTablet = /iPad|Android.*Tablet/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isSafari = /Safari/i.test(ua) && !/Chrome/i.test(ua);
  
  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    isIOS,
    isSafari,
    supportsTouch: 'ontouchstart' in window,
    supportsHover: window.matchMedia('(hover: hover)').matches
  };
};
```

## Testing Checklist

### Mobile Testing
- [ ] iPhone SE (375px)
- [ ] iPhone 14 Pro (390px)
- [ ] Pixel 5 (393px)
- [ ] Galaxy S21 (360px)
- [ ] Landscape orientation
- [ ] With/without keyboard
- [ ] Slow 3G throttling

### Tablet Testing
- [ ] iPad Mini (768px)
- [ ] iPad Pro (1024px)
- [ ] Surface Pro (912px)
- [ ] Split view mode
- [ ] External keyboard

### Desktop Testing
- [ ] 1080p (1920px)
- [ ] 4K displays
- [ ] Multi-monitor
- [ ] Various browsers
- [ ] Keyboard navigation only