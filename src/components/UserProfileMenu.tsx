import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useLastFmAuth } from '../hooks/useLastFmAuth';
import { LastFmAuthDialog } from './LastFmAuthDialog';
import { Music, User, ExternalLink, RefreshCw } from 'lucide-react';

export function UserProfileMenu() {
  const { isAuthenticated, user, isLoading, refreshArtwork } = useLastFmAuth();

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      </Button>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <LastFmAuthDialog>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Music className="h-4 w-4" />
          <span className="hidden sm:inline">Connect Last.fm</span>
        </Button>
      </LastFmAuthDialog>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={user.lastAlbumArt || undefined} 
              alt={`${user.username}'s latest album`} 
            />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.username}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {parseInt(user.userInfo.playcount).toLocaleString()} total plays
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <a 
            href={user.userInfo.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center cursor-pointer"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            <span>View Last.fm Profile</span>
          </a>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={refreshArtwork}>
          <RefreshCw className="mr-2 h-4 w-4" />
          <span>Refresh Artwork</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <LastFmAuthDialog>
          <DropdownMenuItem className="cursor-pointer">
            <Music className="mr-2 h-4 w-4" />
            <span>Manage Connection</span>
          </DropdownMenuItem>
        </LastFmAuthDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}