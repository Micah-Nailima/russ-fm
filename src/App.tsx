import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { AlbumsPage } from './pages/AlbumsPage';
import { ArtistsPage } from './pages/ArtistsPage';
import { ArtistDetailPage } from './pages/ArtistDetailPage';
import { AlbumDetailPage } from './pages/AlbumDetailPage';
import { StatsPage } from './pages/StatsPage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { RandomPage } from './pages/RandomPage';
import { GenrePage } from './pages/GenrePage';

// Component to handle "Various" artist route interception
function ArtistRouteHandler() {
  const { artistPath } = useParams<{ artistPath: string }>();
  
  // Check if this is a "Various" artist route
  if (artistPath && decodeURIComponent(artistPath).toLowerCase() === 'various') {
    // Redirect to artists page instead of showing Various artist page
    return <Navigate to="/artists" replace />;
  }
  
  // For all other artists, show the normal artist detail page
  return <ArtistDetailPage />;
}


function App() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-28">
        <Routes>
          <Route path="/" element={<AlbumsPage />} />
          <Route path="/albums" element={<AlbumsPage />} />
          <Route path="/albums/:page" element={<AlbumsPage />} />
          <Route path="/artists" element={<ArtistsPage />} />
          <Route path="/artists/:page" element={<ArtistsPage />} />
          <Route path="/artist/:artistPath" element={<ArtistRouteHandler />} />
          <Route path="/album/:albumPath" element={<AlbumDetailPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/genres" element={<GenrePage />} />
          <Route path="/random" element={<RandomPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;