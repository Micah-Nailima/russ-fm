import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { usePageTitle } from '@/hooks/usePageTitle';
import { WrappedData } from '@/types/wrapped';
import { BentoGrid } from './components/BentoGrid';
import { YearSelector } from './components/YearSelector';
import { YearPagination } from './components/YearPagination';

export function WrappedYear() {
  const { year } = useParams<{ year: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<WrappedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  const yearNum = year ? parseInt(year, 10) : null;
  const currentYear = new Date().getFullYear();

  // Set page title
  usePageTitle(data ? `${yearNum} Wrapped` : 'Wrapped');

  // If no year provided, redirect to previous year
  if (!year || !yearNum || isNaN(yearNum)) {
    return <Navigate to={`/wrapped/${currentYear - 1}`} replace />;
  }

  // Load available years
  useEffect(() => {
    const loadAvailableYears = async () => {
      try {
        const response = await fetch('/collection.json');
        const collection = await response.json();
        
        const years = new Set<number>();
        collection.forEach((release: any) => {
          const releaseYear = new Date(release.date_added).getFullYear();
          years.add(releaseYear);
        });
        
        setAvailableYears(Array.from(years).sort((a, b) => b - a));
      } catch (err) {
        console.error('Failed to load available years:', err);
      }
    };

    loadAvailableYears();
  }, []);

  // Load wrapped data for the year
  useEffect(() => {
    const loadData = async () => {
      if (!yearNum) return;

      setLoading(true);
      setError(null);

      try {
        const fileName = yearNum === currentYear ? 'wrapped-ytd.json' : `wrapped-${yearNum}.json`;
        const response = await fetch(`/wrapped/${fileName}`);
        
        if (!response.ok) {
          throw new Error(`Failed to load wrapped data for ${yearNum}`);
        }

        const wrappedData = await response.json();
        setData(wrappedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load wrapped data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [yearNum, currentYear]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading wrapped data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Oops!</h2>
          <p className="text-muted-foreground mb-6">{error || 'Failed to load wrapped data'}</p>
          <button
            onClick={() => navigate('/wrapped')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Go to Wrapped Home
          </button>
        </div>
      </div>
    );
  }

  const previousYear = availableYears.find(y => y < yearNum);
  const nextYear = availableYears.find(y => y > yearNum);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold">
              {yearNum} Wrapped
              {data.isYearToDate && <span className="text-sm font-normal text-muted-foreground ml-2">(Year to Date)</span>}
            </h1>
            <YearSelector
              currentYear={yearNum}
              availableYears={availableYears}
              onYearChange={(year) => navigate(`/wrapped/${year}`)}
            />
          </div>
          
          {data.isYearToDate && data.summary.projectedTotal && (
            <p className="text-muted-foreground">
              On track for {data.summary.projectedTotal} releases by year end
            </p>
          )}
        </div>

        {/* Main Bento Grid */}
        <BentoGrid data={data} />

        {/* Navigation */}
        <YearPagination
          currentYear={yearNum}
          previousYear={previousYear}
          nextYear={nextYear}
          onNavigate={(year) => navigate(`/wrapped/${year}`)}
        />
      </div>
    </div>
  );
}