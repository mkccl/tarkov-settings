"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SortOption } from "@/lib/actions/search";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown, TrendingDown, TrendingUp, Star, Download, Eye, Clock } from "lucide-react";

const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: "downloads-desc", label: "Most Downloaded", icon: <Download className="h-4 w-4" /> },
  { value: "downloads-asc", label: "Least Downloaded", icon: <TrendingDown className="h-4 w-4" /> },
  { value: "views-desc", label: "Most Viewed", icon: <Eye className="h-4 w-4" /> },
  { value: "views-asc", label: "Least Viewed", icon: <TrendingDown className="h-4 w-4" /> },
  { value: "stars-desc", label: "Most Starred", icon: <Star className="h-4 w-4" /> },
  { value: "stars-asc", label: "Least Starred", icon: <TrendingDown className="h-4 w-4" /> },
  { value: "recent", label: "Most Recent", icon: <Clock className="h-4 w-4" /> },
];

export function SettingsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = (searchParams.get("sort") as SortOption) || "downloads-desc";

  const handleSortChange = (value: SortOption) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowUpDown className="h-4 w-4" />
        <span className="hidden sm:inline">Sort by:</span>
      </div>
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                {option.icon}
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
