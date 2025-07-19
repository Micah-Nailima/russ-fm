import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';
import { SiLastdotfm, SiDiscogs } from 'react-icons/si';
import { appConfig } from '@/config/app.config';

export function Footer() {
  const { footer } = appConfig;

  // Separate text links from external/connect links
  const textLinks = [
    ...footer.links.about.items,
    ...footer.links.explore.items,
  ];

  const connectLinks = footer.links.external.items;

  return (
    <footer className="mt-12 mb-4">
      <div className="container mx-auto px-4">
        <div className="border-t border-border/50 pt-6">
          {/* Streamlined single row layout */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            {/* Copyright */}
            <div>
              <p>&copy; {footer.copyright.year} {footer.copyright.text}</p>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Compact text links */}
              <div className="flex flex-wrap items-center gap-4">
                {textLinks.slice(0, 4).map((item, index) => (
                  <Link
                    key={index}
                    to={item.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              
              {/* Icon-only connect links */}
              <div className="flex items-center gap-3">
                {connectLinks.map((item, index) => {
                  const getIcon = () => {
                    if (item.label === 'Last.fm') return <SiLastdotfm className="h-4 w-4" />;
                    if (item.label === 'Discogs') return <SiDiscogs className="h-4 w-4" />;
                    if (item.label === 'GitHub') return <Github className="h-4 w-4" />;
                    return <Github className="h-4 w-4" />;
                  };
                  
                  return (
                    <a
                      key={index}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground transition-colors"
                      title={item.label}
                    >
                      {getIcon()}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
