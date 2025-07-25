# Russ FM Scrobbler Implementation Plan

## Implementation Phases

This plan outlines integrating Last.fm scrobbling into the existing Russ FM Cloudflare Workers platform. Since both systems use the same technology stack, integration will be seamless and performant.

## Phase 1: Worker Enhancement & Authentication (Week 1-2)

### Objectives
- Extend existing Cloudflare Worker with scrobbling API endpoints
- Implement Last.fm OAuth authentication flow
- Configure Cloudflare KV for session management

### Worker Backend Tasks

#### 1.1 Enhanced Worker Structure
```bash
# Files to create/modify:
_worker.js                          # Enhanced main worker with API routing
src/worker/                         # New worker modules directory
├── handlers/
│   ├── auth.js                     # Last.fm OAuth implementation  
│   ├── scrobble.js                 # Track/album scrobbling logic
│   └── search.js                   # Optional: Last.fm search enhancement
├── utils/
│   ├── lastfm.js                   # Last.fm API utilities and signatures
│   ├── sessions.js                 # KV session management
│   └── cors.js                     # CORS handling utilities
└── config/
    └── constants.js                # Rate limits, endpoints, defaults
```

**Implementation Steps:**
1. Extend `_worker.js` to route `/api/auth/` and `/api/scrobble/` requests
2. Create Last.fm API utility functions with MD5 signature generation
3. Implement KV-based session management with TTL
4. Add CORS handling for authentication redirects
5. Create secure cookie utilities

#### 1.2 Cloudflare Configuration Updates
```toml
# Add to wrangler.toml
[[kv_namespaces]]
binding = "SESSIONS"
id = "sessions-namespace-id"
preview_id = "preview-sessions-namespace-id"
```

**Setup Commands:**
```bash
# Create KV namespace
wrangler kv:namespace create "SESSIONS"

# Set API secrets
wrangler secret put LASTFM_API_KEY
wrangler secret put LASTFM_SECRET
```

#### 1.3 Authentication API Implementation
```javascript
// API endpoints to implement
POST /api/auth/login              # Initiate Last.fm OAuth
GET  /api/auth/callback           # Handle OAuth callback
GET  /api/auth/status             # Check session status
POST /api/auth/logout             # Clear session
```

### React Frontend Tasks

#### 1.4 Authentication Components
```bash
# Files to create:
src/components/LastFmAuthDialog.tsx        # Authentication modal (shadcn Dialog)
src/components/UserProfileMenu.tsx         # Enhanced navigation user menu
src/hooks/useLastFmAuth.ts                 # Authentication state hook
src/services/scrobbleApi.ts                # Worker API communication
src/types/scrobble.ts                      # TypeScript interfaces
```

**Implementation Steps:**
1. Create authentication dialog using shadcn/ui Dialog component
2. Implement authentication context with React Query
3. Add Last.fm status to existing Navigation component
4. Create TypeScript interfaces for scrobbling data
5. Set up API service layer with proper error handling

#### 1.5 Development Setup
```bash
# Update package.json scripts
npm run dev:worker               # Local development with wrangler
npm run build:worker             # Build worker for deployment

# Environment configuration
echo "VITE_SCROBBLING_ENABLED=true" >> .env.local
```

### Deliverables
- ✅ Working Last.fm OAuth flow in Cloudflare Workers
- ✅ KV-based session management with TTL
- ✅ React authentication UI integrated with existing design
- ✅ Foundation for scrobbling API endpoints

### Testing Checklist
- [ ] Last.fm OAuth redirects work correctly
- [ ] Sessions persist in Cloudflare KV with proper expiration
- [ ] Authentication status displays in React UI
- [ ] Logout clears both cookies and KV sessions

---

## Phase 2: Core Scrobbling Features (Week 3-4)

### Objectives
- Implement track and album scrobbling in Worker
- Add scrobbling UI components to React frontend
- Create progress tracking for bulk operations

### Worker API Tasks

#### 2.1 Scrobbling Implementation
```bash
# Files to create/extend:
src/worker/handlers/scrobble.js            # Core scrobbling logic
src/worker/utils/rateLimit.js              # Last.fm rate limiting
src/worker/utils/batch.js                  # Bulk scrobbling utilities
```

**Implementation Steps:**
1. Implement single track scrobbling with Last.fm API
2. Create album scrobbling with realistic 3-minute intervals
3. Add progress tracking using KV for bulk operations
4. Implement exponential backoff for API failures
5. Add scrobble validation and error handling

#### 2.2 Scrobbling API Endpoints
```javascript
// New endpoints to implement
POST /api/scrobble/track          # Scrobble individual track
POST /api/scrobble/album          # Scrobble full album with progress
GET  /api/scrobble/status/{jobId} # Check bulk scrobbling progress
POST /api/scrobble/cancel/{jobId} # Cancel bulk operation
```

### React Frontend Tasks

#### 2.3 Scrobbling UI Components
```bash
# Files to create:
src/components/ScrobbleButton.tsx          # Button with loading states (shadcn)
src/components/ScrobbleProgress.tsx        # Progress indicator for bulk ops
src/components/ScrobbleToast.tsx           # Success/error notifications
src/hooks/useScrobble.ts                   # Scrobbling operations hook
src/hooks/useScrobbleStatus.ts             # Real-time progress tracking
```

**Implementation Steps:**
1. Create scrobble button using shadcn/ui Button with loading spinner
2. Implement progress tracking with polling for bulk operations
3. Add toast notifications using existing toast system
4. Create React Query mutations for scrobbling operations
5. Handle authentication requirements with redirects

#### 2.4 Album Page Integration
```bash
# Files to modify:
src/pages/AlbumDetailPage.tsx              # Add track-level scrobbling
src/components/AlbumCard.tsx               # Add quick-scrobble action
src/pages/ArtistDetailPage.tsx             # Optional: artist-level actions
```

**Integration Points:**
1. Add scrobble buttons to individual tracks in album view
2. Add "Scrobble Album" button to album headers
3. Display real-time progress during bulk scrobbling
4. Show authentication prompts for unauthenticated users

### Deliverables
- ✅ Working track and album scrobbling via Worker API
- ✅ Real-time progress feedback for bulk operations
- ✅ Seamless integration with existing album pages
- ✅ Comprehensive error handling and retry logic

### Testing Checklist
- [ ] Individual tracks scrobble successfully to Last.fm
- [ ] Album scrobbling completes with 3-minute intervals
- [ ] Progress indicators update correctly during bulk operations
- [ ] Error states display appropriate user messages
- [ ] Authentication flow works from scrobbling actions

---

## Phase 3: Enhanced User Experience (Week 5-6)

### Objectives
- Polish scrobbling integration across all interfaces
- Add user preferences and customization options
- Implement scrobble history and user statistics

### React Frontend Enhancements

#### 3.1 Enhanced Album Cards
```bash
# Files to modify:
src/components/AlbumCard.tsx               # Add quick-scrobble integration
src/components/FilterBar.tsx               # Optional: scrobbling filters
src/components/Navigation.tsx              # Enhanced user menu
```

**Enhancements:**
1. Add subtle scrobble buttons to all album cards
2. Show Last.fm play counts when available
3. Add scrobbling status indicators (recently scrobbled)
4. Implement hover states and smooth animations

#### 3.2 User Profile & History
```bash
# Files to create:
src/components/ScrobbleHistory.tsx         # Recent scrobbling activity
src/components/UserStats.tsx              # Last.fm user statistics
src/hooks/useScrobbleHistory.ts            # History data management
```

**Features:**
1. Display Last.fm username and total play count
2. Show recent scrobbling activity (last 10 scrobbles)
3. Add user statistics and listening trends
4. Create compact history view in user dropdown

#### 3.3 Search & Discovery Enhancement
```bash
# Files to modify:
src/pages/SearchPage.tsx                   # Add Last.fm search integration
src/hooks/useSearch.ts                     # Enhanced search with Last.fm
src/components/SearchResults.tsx           # Show scrobbling options
```

**Improvements:**
1. Optionally integrate Last.fm album search alongside static data
2. Enable one-click scrobbling from search results
3. Show Last.fm popularity metrics (play counts, listeners)
4. Add "quick scrobble" actions for authenticated users

### Optional Worker Enhancements

#### 3.4 Enhanced Search API (Optional)
```javascript
// Optional: Add Last.fm search to complement static data
GET /api/search/lastfm                     # Search Last.fm albums
GET /api/search/lastfm/album               # Get album details from Last.fm
```

### Deliverables
- ✅ Polished scrobbling integration across all album interfaces
- ✅ User profile with Last.fm statistics and recent activity
- ✅ Enhanced search with optional Last.fm integration
- ✅ Smooth animations and micro-interactions

### Testing Checklist
- [ ] Scrobble buttons integrate seamlessly with existing design
- [ ] User statistics display correctly in navigation
- [ ] Search results optionally show Last.fm data
- [ ] All interactions feel smooth and responsive

---

## Phase 4: Advanced Features & Polish (Week 7-8)

### Objectives
- Add advanced scrobbling features
- Implement performance optimizations
- Add comprehensive error handling and logging

### Advanced Worker Features

#### 4.1 Bulk Scrobbling Enhancements
```bash
# Files to create:
src/worker/handlers/bulk.js               # Bulk scrobbling operations
src/worker/utils/queue.js                 # KV-based job queue
src/worker/utils/scheduler.js             # Delayed execution handling
```

**Features:**
1. Collection-wide bulk scrobbling with progress tracking
2. Duplicate detection and prevention using KV storage
3. Scheduled scrobbling for delayed operations
4. Resume capability for interrupted bulk operations

#### 4.2 Enhanced React Components
```bash
# Files to create:
src/components/BulkScrobbleDialog.tsx     # Bulk operation modal
src/components/ScrobbleQueue.tsx          # Queue management interface
src/hooks/useBulkScrobble.ts              # Bulk operation management
src/hooks/useScrobbleQueue.ts             # Queue status tracking
```

**Features:**
1. Bulk scrobbling from filtered album collections
2. Queue management with cancel/pause functionality
3. Collection-wide scrobbling with user confirmations
4. Real-time progress tracking for large operations

#### 4.3 Mobile & Touch Optimization
```bash
# Files to modify:
src/components/ScrobbleButton.tsx         # Touch-friendly interactions
src/components/AlbumCard.tsx              # Mobile-optimized layout
src/styles/scrobble.css                   # Mobile-specific styles
```

**Improvements:**
1. Touch-optimized scrobble buttons with proper sizing
2. Swipe gestures for quick scrobbling actions
3. Mobile-specific progress indicators and modals
4. Responsive design optimizations for small screens

### Performance & Edge Optimization

#### 4.4 Cloudflare KV Optimization
```bash
# Files to create/modify:
src/worker/utils/cache.js                 # KV caching strategies
src/worker/utils/performance.js           # Performance monitoring
```

**Optimizations:**
1. Intelligent KV caching of Last.fm responses with appropriate TTL
2. Edge location optimization for global response times
3. Request batching to minimize API calls
4. Efficient session and progress storage patterns

#### 4.5 Error Handling & Monitoring
```bash
# Files to create:
src/worker/utils/monitoring.js            # Error tracking and analytics
src/worker/utils/recovery.js              # Failure recovery strategies
```

**Features:**
1. Comprehensive error logging with edge location tracking
2. Automatic retry logic with exponential backoff
3. Failed scrobble recovery and queue management
4. Usage analytics and performance monitoring

### Deliverables
- ✅ Advanced bulk scrobbling with queue management
- ✅ Optimized edge performance for global users
- ✅ Mobile-first responsive design
- ✅ Comprehensive error handling and monitoring

### Testing Checklist
- [ ] Bulk operations handle 100+ albums efficiently
- [ ] Performance remains consistent across global edge locations
- [ ] Mobile interface provides excellent touch experience
- [ ] Error recovery works for network and API failures

---

## Configuration & Deployment

### Cloudflare Workers Setup

#### KV Namespace Creation
```bash
# Create production KV namespace
wrangler kv:namespace create "SESSIONS" 

# Create preview KV namespace  
wrangler kv:namespace create "SESSIONS" --preview
```

#### Environment Configuration
```bash
# Set Last.fm API secrets
wrangler secret put LASTFM_API_KEY
wrangler secret put LASTFM_SECRET

# Optional: Enhanced search capability
wrangler secret put DISCOGS_API_KEY
```

#### Enhanced wrangler.toml
```toml
name = "russ-fm"
compatibility_date = "2024-03-01"
main = "./_worker.js"

# Static assets (existing)
[assets]
directory = "./dist-worker"
binding = "ASSETS"

# KV storage for sessions
[[kv_namespaces]]
binding = "SESSIONS"
id = "<your-production-namespace-id>"
preview_id = "<your-preview-namespace-id>"

# Environment variables
[vars]
ENVIRONMENT = "production"
ALLOWED_ORIGINS = "https://russ.fm,https://preview.russ.fm"

# Preview environment
[env.preview]
vars = { ENVIRONMENT = "preview" }
```

### Development Workflow

#### Enhanced Build Scripts
```json
// package.json scripts
{
  "scripts": {
    "dev": "vite",
    "dev:worker": "wrangler dev",
    "build": "vite build --outDir dist-worker",
    "build:worker": "npm run build && node scripts/build-worker.js",
    "deploy": "npm run build:worker && wrangler deploy",
    "test": "vitest",
    "test:worker": "vitest run src/worker/**/*.test.js"
  }
}
```

### Feature Configuration
```typescript
// src/config/app.config.ts
export const appConfig = {
  // Existing config...
  features: {
    scrobbling: {
      enabled: import.meta.env.VITE_SCROBBLING_ENABLED !== 'false',
      bulkScrobbling: true,
      maxBulkSize: 100, // Albums per bulk operation
      progressPollingInterval: 2000, // ms
      sessionTimeout: 24 * 60 * 60 * 1000 // 24 hours
    }
  },
  lastfm: {
    rateLimit: 5, // requests per second
    retryAttempts: 3,
    retryDelay: 1000 // ms
  }
}
```

## Risk Mitigation

### Technical Risks
1. **Last.fm API Rate Limits**: Implement KV-based queuing and intelligent request batching
2. **Authentication Expiry**: Auto-refresh sessions stored in KV with graceful re-auth
3. **Edge Performance**: Leverage Cloudflare's global network for consistent response times
4. **KV Storage Limits**: Efficient data structures and automatic cleanup with TTL

### User Experience Risks
1. **Learning Curve**: Progressive disclosure with onboarding tooltips
2. **Network Latency**: Edge caching and optimistic UI updates
3. **Integration Complexity**: Maintain existing React patterns and design system
4. **Mobile Performance**: Touch-optimized components with proper sizing

### Operational Risks
1. **Cloudflare Service Limits**: Monitor usage and implement graceful degradation
2. **Session Management**: Robust KV cleanup and session validation
3. **API Availability**: Fallback messaging and retry strategies
4. **Deployment Issues**: Comprehensive testing in preview environment

## Success Metrics

### Performance Metrics
- Edge response times < 100ms globally for scrobbling operations
- Success rate > 99% for individual scrobbles
- Bulk operations complete within 3 minutes per 50 tracks
- Zero session data loss with 24-hour persistence

### User Experience Metrics
- Time to first scrobble < 15 seconds from login (OAuth flow)
- Mobile scrobbling interface usable on screens ≥ 320px wide
- Error recovery successful in > 95% of failed attempts
- User retention rate > 80% after first successful scrobble

### Integration Quality Metrics
- Zero disruption to existing album browsing workflows
- Scrobbling UI integrates seamlessly with shadcn/ui design system
- React component tree depth increase < 10% with scrobbling features
- Bundle size increase < 50KB with all scrobbling functionality

## Maintenance Plan

### Ongoing Development
- Monitor Last.fm API changes and deprecation notices
- Regular testing of OAuth flows and session management
- Performance monitoring via Cloudflare Analytics
- User feedback collection and feature iteration

### Monitoring & Analytics
- Track scrobbling success/failure rates via KV analytics
- Monitor edge performance across global locations
- User engagement metrics for scrobbling features
- Error tracking and automatic alerting

### Documentation & Support
- Worker API documentation for scrobbling endpoints
- React component documentation with usage examples
- User guide for Last.fm integration and troubleshooting
- Migration guide for future Cloudflare Workers updates

### Technical Debt Management
- Regular KV storage cleanup and optimization
- Worker bundle size monitoring and optimization
- React component performance profiling
- Dependency updates and security patches

## Python Backend Integration

The existing Python data collection workflow remains unchanged and independent:

```bash
# Existing workflow continues as-is
cd scrapper
python main.py collection               # Generate static JSON data
python main.py collection --resume      # Resume processing

# Optional: Add Last.fm metadata to static data
python main.py lastfm-enhance          # Future enhancement
```

The Python backend generates static data consumed by React, while the enhanced Cloudflare Worker provides dynamic scrobbling functionality. This separation ensures:

- **Independence**: Data collection and scrobbling operate separately
- **Reliability**: Static data remains available even if scrobbling is unavailable  
- **Performance**: Static JSON loading remains unaffected by dynamic features
- **Scalability**: Each system can scale independently based on usage patterns

This implementation plan leverages the existing Cloudflare Workers architecture to add powerful scrobbling functionality while maintaining the elegant simplicity and global performance of the current platform.