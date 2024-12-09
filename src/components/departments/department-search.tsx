import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface DepartmentSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function DepartmentSearch({ value, onChange }: DepartmentSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search departments..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8"
      />
    </div>
  );
}
