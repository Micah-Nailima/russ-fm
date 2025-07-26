import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface YearSelectorProps {
  currentYear: number;
  availableYears: number[];
  onYearChange: (year: number) => void;
}

export function YearSelector({ currentYear, availableYears, onYearChange }: YearSelectorProps) {
  return (
    <Select value={currentYear.toString()} onValueChange={(value) => onYearChange(parseInt(value, 10))}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select year" />
      </SelectTrigger>
      <SelectContent>
        {availableYears.map((year) => (
          <SelectItem key={year} value={year.toString()}>
            {year}
            {year === new Date().getFullYear() && ' (Year to Date)'}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}