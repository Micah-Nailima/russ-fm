import { useState } from 'react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useLastFmAuth } from '../hooks/useLastFmAuth';
import { useScrobble } from '../hooks/useScrobble';
import { LastFmAuthDialog } from './LastFmAuthDialog';
import { Music, Check, AlertCircle, Loader2 } from 'lucide-react';
import { ScrobbleRequest } from '../types/scrobble';

interface ScrobbleButtonProps {
  track: ScrobbleRequest;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function ScrobbleButton({ track, variant = 'ghost', size = 'sm', className }: ScrobbleButtonProps) {
  const { isAuthenticated } = useLastFmAuth();
  const { scrobbleTrack, isScrobbling, error } = useScrobble();
  const [scrobbled, setScrobbled] = useState(false);

  const handleScrobble = async () => {
    if (!isAuthenticated) return;

    try {
      await scrobbleTrack(track);
      setScrobbled(true);
      
      // Reset scrobbled state after 3 seconds
      setTimeout(() => setScrobbled(false), 3000);
    } catch (err) {
      // Error is handled by the hook
      console.error('Scrobble failed:', err);
    }
  };

  const getIcon = () => {
    if (isScrobbling) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (scrobbled) return <Check className="h-4 w-4 text-green-500" />;
    if (error) return <AlertCircle className="h-4 w-4 text-destructive" />;
    return <Music className="h-4 w-4" />;
  };

  const getTooltipContent = () => {
    if (!isAuthenticated) return 'Connect to Last.fm to scrobble';
    if (isScrobbling) return 'Scrobbling...';
    if (scrobbled) return 'Scrobbled successfully!';
    if (error) return `Failed to scrobble: ${error}`;
    return `Scrobble "${track.track}" by ${track.artist}`;
  };

  const button = (
    <Button
      variant={variant}
      size={size}
      onClick={handleScrobble}
      disabled={isScrobbling || scrobbled}
      className={className}
    >
      {getIcon()}
      {size !== 'sm' && (
        <span className="ml-2">
          {isScrobbling ? 'Scrobbling...' : scrobbled ? 'Scrobbled!' : 'Scrobble'}
        </span>
      )}
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