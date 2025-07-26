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
        "bg-card border border-border rounded-lg p-6 h-full transition-all duration-300 ease-out",
        onClick && "cursor-pointer hover:shadow-lg hover:border-primary/20 hover:scale-[1.02]",
        !onClick && "hover:shadow-md hover:border-border/60",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}