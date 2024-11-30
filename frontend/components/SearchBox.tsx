import { Search } from "lucide-react";

export function SearchBox() {
  return (
    <div className="flex items-center gap-2.5 rounded-lg bg-fills-primary px-2 py-[7px] text-labels-secondary">
      <Search className="w-5 h-5" />
      Search
    </div>
  )
}