import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface BaseCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function BaseCard({ children, className, onClick }: BaseCardProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-lg p-6 h-full transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-lg hover:border-primary/20",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}