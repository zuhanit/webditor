import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  Sidebar,
} from "../ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

/**
 * Project component
 *
 * Project includes only directory paths. It shows directory paths as a tree structure.
 * @returns Project
 */
export function AssetSidebar() {
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>Project</SidebarHeader>
      <SidebarContent>
        <Collapsible>
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>Label</CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>Content</SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>
    </Sidebar>
  );
}
