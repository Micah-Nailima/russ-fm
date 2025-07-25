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
import { User, ExternalLink, LogOut } from 'lucide-react';
import { SiLastdotfm } from 'react-icons/si';

export function UserProfileMenu() {
  const { isAuthenticated, user, isLoading, logout } = useLastFmAuth();

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
        <Button 
          variant="ghost" 
          className="relative h-8 w-8 rounded-full bg-[#d51007] hover:bg-[#d51007]/90 border-[#d51007]"
          title="Connect to Last.fm"
        >
          <SiLastdotfm className="h-4 w-4 text-white" />
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
              src={user.userAvatar || user.lastAlbumArt || undefined} 
              alt={`${user.username}'s avatar`} 
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
        
        <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}