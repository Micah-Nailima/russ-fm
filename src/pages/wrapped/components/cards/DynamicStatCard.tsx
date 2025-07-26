import { StatCardData, GridSize } from '@/types/wrapped';
import { Calendar, TrendingUp, Users, Music, Clock, Hash } from 'lucide-react';

interface DynamicStatCardProps {
  stat: StatCardData;
  size: GridSize;
}

export function DynamicStatCard({ stat, size }: DynamicStatCardProps) {
  // Get appropriate icon based on stat type
  const getIcon = () => {
    const iconSize = size === 'extra-wide' ? 'w-6 h-6' : size === 'large' ? 'w-8 h-8' : size === 'medium' ? 'w-6 h-6' : 'w-5 h-5';
    const iconClass = `${iconSize} text-white/70`;
    
    switch (stat.type) {
      case 'total':
        return <Hash className={iconClass} />;
      case 'peak':
        return <TrendingUp className={iconClass} />;
      case 'average':
        return <Clock className={iconClass} />;
      case 'unique':
        return <Users className={iconClass} />;
      case 'first':
      case 'last':
        return <Calendar className={iconClass} />;
      case 'decades':
      case 'timeline':
      case 'genre':
        return <Music className={iconClass} />;
      default:
        return <Hash className={iconClass} />;
    }
  };

  // Get background gradient based on stat type
  const getBackgroundGradient = () => {
    switch (stat.type) {
      case 'total':
        return 'bg-gradient-to-br from-blue-600 to-blue-800';
      case 'peak':
        return 'bg-gradient-to-br from-green-600 to-green-800';
      case 'average':
        return 'bg-gradient-to-br from-purple-600 to-purple-800';
      case 'unique':
        return 'bg-gradient-to-br from-orange-600 to-orange-800';
      case 'first':
        return 'bg-gradient-to-br from-indigo-600 to-indigo-800';
      case 'last':
        return 'bg-gradient-to-br from-pink-600 to-pink-800';
      case 'decades':
        return 'bg-gradient-to-br from-teal-600 to-teal-800';
      case 'timeline':
        return 'bg-gradient-to-br from-red-600 to-red-800';
      case 'genre':
        return 'bg-gradient-to-br from-amber-600 to-amber-800';
      default:
        return 'bg-gradient-to-br from-gray-600 to-gray-800';
    }
  };

  // Format value for display
  const formatValue = () => {
    if (typeof stat.value === 'number') {
      return stat.value.toLocaleString();
    }
    return stat.value;
  };

  // Get text sizes based on card size
  const getTextSizes = () => {
    if (size === 'extra-wide') {
      return {
        title: 'text-lg',
        value: 'text-2xl',
        subtitle: 'text-base'
      };
    } else if (size === 'large') {
      return {
        title: 'text-lg',
        value: 'text-4xl',
        subtitle: 'text-base'
      };
    } else if (size === 'medium') {
      return {
        title: 'text-base',
        value: 'text-2xl',
        subtitle: 'text-sm'
      };
    } else {
      return {
        title: 'text-sm',
        value: 'text-xl',
        subtitle: 'text-xs'
      };
    }
  };

  const textSizes = getTextSizes();

  const isTimelineLayout = size === 'extra-wide' && stat.type === 'timeline';

  return (
    <div className={`
      relative w-full rounded-lg overflow-hidden 
      ${getBackgroundGradient()}
      transition-all duration-300 hover:shadow-lg
      ${isTimelineLayout ? '' : 'aspect-square'}
    `}
      style={{ transform: 'translateZ(0)' }}
    >
      {/* Background pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:24px_24px]" />
      </div>

      {/* Content */}
      <div className={`relative h-full ${isTimelineLayout ? 'p-4' : 'p-3'}`}>
        {isTimelineLayout ? (
          // Extra-wide layout for timeline (detailed bar chart 4x2)
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className={`font-semibold text-white/90 ${textSizes.title}`}>
                {stat.title}
              </div>
              {getIcon()}
            </div>
            <div className="flex-1 flex items-end justify-end gap-2 min-h-0">
              {stat.data && Array.isArray(stat.data) ? stat.data.map((month: any, index: number) => {
                const timelineData = stat.data as any[];
                const maxCount = Math.max(...timelineData.map((m: any) => m.count));
                const height = (month.count / maxCount) * 100;
                return (
                  <div key={index} className="flex flex-col items-center gap-1 flex-1 h-full min-h-0">
                    <div className="text-xs text-white/60 mb-1">
                      {month.count}
                    </div>
                    <div className="flex flex-col justify-end flex-1 w-full min-h-0">
                      <div 
                        className="bg-white/80 w-full rounded-sm transition-all duration-300 hover:bg-white"
                        style={{ height: `${maxCount > 0 ? Math.max(height, month.count > 0 ? 8 : 3) : 3}%` }}
                      />
                    </div>
                    <span className="text-white/70 text-xs mt-1 font-medium">
                      {month.month.slice(0, 3)}
                    </span>
                  </div>
                );
              }) : null}
            </div>
          </div>
        ) : (
          // Standard square layout for all other cards including individual genres
          <div className="h-full flex flex-col justify-between">
            {/* Header with icon */}
            <div className="flex items-start justify-between">
              <div className={`font-semibold text-white/90 ${textSizes.title} leading-tight`}>
                {stat.title}
              </div>
              {getIcon()}
            </div>

            {/* Main value */}
            <div className="flex-1 flex items-center justify-center">
              <div className={`font-bold text-white ${textSizes.value} text-center leading-none`}>
                {formatValue()}
              </div>
            </div>

            {/* Subtitle if available */}
            {stat.subtitle && (
              <div className={`text-white/80 ${textSizes.subtitle} text-center leading-tight`}>
                {stat.subtitle}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}