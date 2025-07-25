import { useState } from 'react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useLastFmAuth } from '../hooks/useLastFmAuth';
import { useScrobble } from '../hooks/useScrobble';
import { LastFmAuthDialog } from './LastFmAuthDialog';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { SiLastdotfm } from 'react-icons/si';
import { AlbumScrobbleRequest } from '../types/scrobble';

interface AlbumScrobbleButtonProps {
  album: AlbumScrobbleRequest;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  fullWidth?: boolean;
}

export function AlbumScrobbleButton({ 
  album, 
  variant = 'outline', 
  size = 'default', 
  className = '',
  fullWidth = false 
}: AlbumScrobbleButtonProps) {
  const { isAuthenticated } = useLastFmAuth();
  const { scrobbleAlbum, isScrobbling, error } = useScrobble();
  const [scrobbled, setScrobbled] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  const handleScrobble = async () => {
    if (!isAuthenticated) return;

    try {
      setProgress({ current: 0, total: album.tracks.length });
      const response = await scrobbleAlbum(album);
      
      if (response.success) {
        setScrobbled(true);
        setProgress(null);
        
        // Reset scrobbled state after 5 seconds
        setTimeout(() => setScrobbled(false), 5000);
      }
    } catch (err) {
      console.error('Album scrobble failed:', err);
      setProgress(null);
    }
  };

  const getIcon = () => {
    if (isScrobbling) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (scrobbled) return <Check className="h-4 w-4 text-green-500" />;
    if (error) return <AlertCircle className="h-4 w-4 text-destructive" />;
    return <SiLastdotfm className="h-4 w-4" />;
  };

  const getButtonText = () => {
    if (isScrobbling && progress) {
      return `Scrobbling ${progress.current}/${progress.total}...`;
    }
    if (isScrobbling) return 'Scrobbling...';
    if (scrobbled) return 'Scrobbled!';
    return 'Scrobble to Last.fm';
  };

  const getTooltipContent = () => {
    if (!isAuthenticated) return 'Connect to Last.fm to scrobble';
    if (isScrobbling) return `Scrobbling "${album.album}" by ${album.artist}...`;
    if (scrobbled) return 'Album scrobbled successfully!';
    if (error) return `Failed to scrobble: ${error}`;
    return `Scrobble "${album.album}" by ${album.artist} (${album.tracks.length} tracks)`;
  };

  const buttonClassName = `
    ${fullWidth ? 'w-full' : ''} 
    ${className}
    ${!isAuthenticated || scrobbled ? '' : 'btn-lastfm'}
  `.trim();

  const button = (
    <Button
      variant={variant}
      size={size}
      onClick={handleScrobble}
      disabled={isScrobbling || scrobbled}
      className={buttonClassName}
    >
      {getIcon()}
      <span className="service-text">
        {getButtonText()}
      </span>
    </Button>
  );

  if (!isAuthenticated) {
    return (
      <LastFmAuthDialog>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            {getTooltipContent()}
          </TooltipContent>
        </Tooltip>
      </LastFmAuthDialog>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {button}
      </TooltipTrigger>
      <TooltipContent>
        {getTooltipContent()}
      </TooltipContent>
    </Tooltip>
  );
}