import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  className?: string;
  size?: 'small' | 'medium' | 'large' | 'wide';
  hasImage?: boolean;
}

export function SkeletonCard ({ 
  className, 
  size = 'medium', 
  hasImage = false 
}: SkeletonCardProps) {
  const sizeClasses = {
    small: 'h-32',
    medium: 'h-48',
    large: 'h-64',
    wide: 'h-32'
  };

  return (
    <div
      className={cn(
        'bg-card border border-border rounded-lg p-6 animate-pulse',
        sizeClasses[size],
        className
      )}
    >
      {hasImage ? (
        <div className="flex flex-col space-y-3">
          <div className="bg-gray-300 dark:bg-gray-700 rounded aspect-square"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
        </div>
      )}
    </div>
  );
}