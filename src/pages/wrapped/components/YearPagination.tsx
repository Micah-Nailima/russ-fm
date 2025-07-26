import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface YearPaginationProps {
  currentYear: number;
  previousYear?: number;
  nextYear?: number;
  onNavigate: (year: number) => void;
}

export function YearPagination({ currentYear, previousYear, nextYear, onNavigate }: YearPaginationProps) {
  return (
    <div className="flex items-center justify-between mt-12 pt-8 border-t">
      <Button
        variant="outline"
        onClick={() => previousYear && onNavigate(previousYear)}
        disabled={!previousYear}
        className="flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-md"
      >
        <ChevronLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
        {previousYear || 'Previous'}
      </Button>

      <span className="text-sm text-muted-foreground font-medium">
        {currentYear}
      </span>

      <Button
        variant="outline"
        onClick={() => nextYear && onNavigate(nextYear)}
        disabled={!nextYear}
        className="flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-md group"
      >
        {nextYear || 'Next'}
        <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
      </Button>
    </div>
  );
}