import { Navigate } from 'react-router-dom';

export function WrappedYTD() {
  const currentYear = new Date().getFullYear();
  
  // Redirect to the current year wrapped page which will show YTD data
  return <Navigate to={`/wrapped/${currentYear}`} replace />;
}