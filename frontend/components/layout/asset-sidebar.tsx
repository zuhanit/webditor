import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  Sidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
} from "../ui/sidebar";
import { useUsemapStore } from "@/store/mapStore";
import { AssetType } from "@/types/asset";
import { Folder, Minus, Plus } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { useAssetExplorerStore } from "@/store/assetExplorerStore";

export function AssetSidebarItem({ asset }: { asset: AssetType }) {
  const { setCurrentAsset } = useAssetExplorerStore();

  if (asset.type === "folder") {
    if (asset.children && asset.children.length > 0) {
      const isAllFiles = asset.children.every((child) => child.type === "file");
      if (isAllFiles) {
        return (
          <SidebarMenuButton
            className="flex items-center gap-2"
            onClick={() => setCurrentAsset(asset)}
          >
            <Folder className="size-4 text-blue" strokeWidth={3} />
            {asset.name}
          </SidebarMenuButton>
        );
      }

      const folderChildren = asset.children.filter(
        (child) => child.type === "folder",
      );
      return (
        <Collapsible key={asset.name} className="group/collapsible">
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton className="flex items-center gap-2">
                <Folder className="size-4 text-blue" strokeWidth={3} />
                {asset.name}
                <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenuSub>
                  {folderChildren.map((child) => (
                    <AssetSidebarItem key={child.name} asset={child} />
                  ))}
                </SidebarMenuSub>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      );
    } else if (asset.children && asset.children.length === 0) {
      return (
        <SidebarMenuButton
          className="flex items-center gap-2"
          onClick={() => setCurrentAsset(asset)}
        >
          <Folder className="size-4 text-blue" strokeWidth={3} />
          {asset.name}
        </SidebarMenuButton>
      );
    }
  }
}
/**
 * Project component
 *
 * Project includes only directory paths. It shows directory paths as a tree structure.
 * @returns Project
 */
export function AssetSidebar() {
  const usemap = useUsemapStore((state) => state.usemap);

  if (usemap === null) return <div>Loading...</div>;

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>Project</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {usemap.assets.children!.map((asset: AssetType) => (
              <AssetSidebarItem key={asset.name} asset={asset} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
