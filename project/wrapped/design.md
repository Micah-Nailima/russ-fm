# Record Collection Wrapped - Technical Design Document

## Overview

A year-in-review feature for the russ.fm record collection site that analyzes and presents personalized insights about the user's vinyl collecting patterns and music preferences. The feature will be accessible at `/wrapped` with year-based routing.

## Architecture

### URL Structure
- `/wrapped` - Defaults to previous year (2024)
- `/wrapped/2024` - Specific year view
- `/wrapped/all-time` - All-time statistics
- Year selector for navigation between different years

### Data Sources
All data will be derived from existing JSON files:
- `/public/collection.json` - Main collection data
- `/public/album/{slug}/{slug}.json` - Detailed album information
- `/public/artist/{slug}/{slug}.json` - Detailed artist information

### Available Data Points

From `collection.json`:
- `date_added` - When album was added to collection
- `date_release_year` - Album release year
- `genre_names` - Array of genres
- `release_artist` - Primary artist name
- `artists` - Array of artist objects with biographies

From album JSON files:
- `country` - Country of release
- `formats` - Physical format types
- `labels` - Record labels
- `styles` - Sub-genres/styles
- Service IDs (Spotify, Apple Music, Last.fm)

## Component Architecture

### Page Structure
```
WrappedPage/
├── YearSelector.tsx          # Year navigation component
├── HeroSection.tsx           # Main stats and intro
├── GenreDNA.tsx              # Genre analysis visualization
├── CollectionTimeline.tsx    # Acquisition patterns
├── ArtistSpotlight.tsx       # Top artists analysis
├── DecadesExplorer.tsx       # Release year breakdown
├── VisualShowcase.tsx        # Album art gallery
├── ShareableCards.tsx        # Social sharing components
└── index.tsx                 # Main page orchestrator
```

### Data Processing Layer
```
src/lib/wrapped/
├── dataProcessor.ts          # Main data aggregation
├── genreAnalyzer.ts         # Genre statistics
├── timelineBuilder.ts       # Time-based analytics
├── artistMetrics.ts         # Artist-related calculations
└── visualAnalyzer.ts        # Album artwork analysis
```

## Feature Specifications

### 1. Hero Section
**Data Requirements:**
- Total albums in collection (filtered by year)
- Collection growth percentage
- Total unique artists
- Date range coverage

**Visual Design:**
- Large animated counter for total albums
- Gradient background using dominant album colors
- Smooth scroll to reveal insights

### 2. Genre DNA Analysis
**Data Processing:**
- Count frequency of each genre
- Calculate genre diversity score
- Track genre evolution over time
- Identify most unique genres

**Visualization:**
- Interactive bubble chart using D3.js or Recharts
- Genre percentages with visual hierarchy
- Click to filter collection by genre

### 3. Collection Timeline
**Data Points:**
- Monthly acquisition counts
- Peak collecting periods
- Recent activity trends
- Seasonal patterns

**Implementation:**
- Line/area chart for collection growth
- Heat map for acquisition intensity
- Milestone markers for significant additions

### 4. Artist Deep Dive
**Analytics:**
- Most collected artists (multiple albums)
- Artist diversity metrics
- Geographic distribution (from country data)
- Collaboration patterns

**Components:**
- Artist cards with avatar images
- Biography excerpts
- Link to full artist pages

### 5. Decades Explorer
**Data Analysis:**
- Group albums by release decade
- Calculate median/average release year
- Identify vintage finds (pre-1980)
- Show decade distribution

**Visual Elements:**
- Timeline visualization
- Decade cards with representative albums
- Era-specific styling

### 6. Visual Showcase
**Image Processing:**
- Extract dominant colors from album artwork
- Create album art collages
- Identify visual patterns

**Features:**
- Mosaic grid of recent additions
- Color palette analysis
- Animated transitions

## Technical Implementation

### State Management
```typescript
interface WrappedState {
  year: number | 'all-time';
  data: ProcessedWrappedData;
  filters: FilterOptions;
  loading: boolean;
}

interface ProcessedWrappedData {
  totalAlbums: number;
  uniqueArtists: number;
  genres: GenreStats[];
  timeline: TimelineData[];
  topArtists: ArtistStats[];
  decades: DecadeStats[];
  recentAdditions: Album[];
}
```

### Data Processing Pipeline
1. Load and parse collection.json
2. Filter by selected year
3. Aggregate statistics
4. Load additional data for featured items
5. Calculate derived metrics
6. Cache processed results

### Performance Optimizations
- Lazy load detailed album/artist data
- Use React.memo for expensive visualizations
- Implement virtual scrolling for large lists
- Progressive image loading
- Service worker caching for JSON data

### Responsive Design
- Mobile-first approach
- Touch-friendly interactions
- Simplified visualizations on small screens
- Swipeable cards for mobile

## UI/UX Design

### Visual Theme
- Dark mode by default with subtle animations
- Vinyl-inspired design elements
- Smooth transitions between sections
- Parallax scrolling effects

### Typography
- Display font for hero numbers
- System fonts for body text
- Consistent hierarchy

### Color Palette
- Dynamic colors extracted from album artwork
- Spotify Wrapped-inspired gradients
- High contrast for accessibility

### Animations
- Number counters with easing
- Staggered reveal animations
- Smooth scroll behavior
- Hover states for interactive elements

## Sharing Features

### Shareable Cards
Generate static images for:
- Top genres breakdown
- Collection stats summary
- Favorite artists grid
- Year in review highlights

### Implementation
- Canvas API for image generation
- Pre-configured templates
- Download and social media integration

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Progressive enhancement for older browsers
- Fallback for missing features

## Accessibility
- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader announcements
- High contrast mode support

## Future Enhancements
- Playlist generation from top tracks
- Collection value estimates
- Recommendation engine
- Community comparisons
- Export to PDF report