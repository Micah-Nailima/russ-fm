import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  animation?: 'slideUp' | 'slideLeft' | 'slideRight' | 'fadeIn' | 'scaleUp';
}

export function AnimatedCard({ 
  children, 
  className, 
  delay = 0,
  animation = 'slideUp'
}: AnimatedCardProps) {
  const { elementRef, isVisible } = useScrollAnimation({ delay });

  const animationClasses = {
    slideUp: {
      initial: 'translate-y-8 opacity-0',
      animate: 'translate-y-0 opacity-100'
    },
    slideLeft: {
      initial: 'translate-x-8 opacity-0',
      animate: 'translate-x-0 opacity-100'
    },
    slideRight: {
      initial: '-translate-x-8 opacity-0',
      animate: 'translate-x-0 opacity-100'
    },
    fadeIn: {
      initial: 'opacity-0',
      animate: 'opacity-100'
    },
    scaleUp: {
      initial: 'scale-95 opacity-0',
      animate: 'scale-100 opacity-100'
    }
  };

  const { initial, animate } = animationClasses[animation];

  return (
    <div
      ref={elementRef}
      className={cn(
        'transform transition-all duration-700 ease-out',
        isVisible ? animate : initial,
        className
      )}
    >
      {children}
    </div>
  );
}