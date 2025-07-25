import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useLastFmAuth } from '../hooks/useLastFmAuth';
import { ExternalLink, User, LogOut } from 'lucide-react';
import { SiLastdotfm } from 'react-icons/si';

interface LastFmAuthDialogProps {
  children: React.ReactNode;
}

export function LastFmAuthDialog({ children }: LastFmAuthDialogProps) {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user, isLoading, error, login, logout } = useLastFmAuth();

  const handleLogin = async () => {
    await login();
    // Dialog will stay open to show auth status
  };

  const handleLogout = async () => {
    await logout();
    setOpen(false);
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Last.fm Authentication</DialogTitle>
            <DialogDescription>
              Loading authentication status...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SiLastdotfm className="h-5 w-5 text-[#d51007]" />
            Last.fm Authentication
          </DialogTitle>
          <DialogDescription>
            {isAuthenticated 
              ? 'You are connected to Last.fm and can scrobble tracks.'
              : 'Connect to Last.fm to scrobble your listening history.'
            }
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {isAuthenticated && user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage 
                    src={user.userAvatar || user.lastAlbumArt || undefined} 
                    alt={`${user.username}'s avatar`} 
                  />
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {user.username}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {parseInt(user.userInfo.playcount).toLocaleString()} total plays
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a 
                    href={user.userInfo.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    Profile
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Disconnect
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-6">
                <SiLastdotfm className="h-12 w-12 mx-auto text-[#d51007] mb-3" />
                <h3 className="font-medium mb-2">Connect to Last.fm</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Authenticate with Last.fm to enable scrobbling from your music collection.
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleLogin}
                  className="flex-1 flex items-center gap-2 bg-[#d51007] hover:bg-[#d51007]/90 border-[#d51007]"
                >
                  <SiLastdotfm className="h-4 w-4" />
                  Connect Last.fm
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}