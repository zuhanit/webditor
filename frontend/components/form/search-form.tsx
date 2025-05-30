import { Search } from "lucide-react";
import { SidebarGroup, SidebarGroupContent, SidebarInput } from "../ui/sidebar";
import { Label } from "../ui/label";

export function SearchForm({
  onSearch,
  ...props
}: React.ComponentProps<"form"> & { onSearch: (searchTerm: string) => void }) {
  return (
    <form {...props}>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <SidebarInput
            id="search"
            placeholder="Search"
            className="pl-8"
            onChange={(e) => onSearch(e.target.value)}
          />
          <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 opacity-50" />
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  );
}
