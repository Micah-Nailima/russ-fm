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
        className="flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        {previousYear || 'Previous'}
      </Button>

      <span className="text-sm text-muted-foreground">
        {currentYear}
      </span>

      <Button
        variant="outline"
        onClick={() => nextYear && onNavigate(nextYear)}
        disabled={!nextYear}
        className="flex items-center gap-2"
      >
        {nextYear || 'Next'}
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}